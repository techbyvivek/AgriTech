const Product = require('../models/Product');
const CropListing = require('../models/CropListing');
const Bid = require('../models/Bid');
const Order = require('../models/Order');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');

exports.products = asyncHandler(async (req,res) => {
  const filter = { active: true };
  if (req.query.search) filter.name = { $regex: escapeRegex(String(req.query.search).slice(0,80)), $options:'i' };
  if (req.query.category) filter.category = req.query.category;
  const products = await Product.find(filter).populate('seller','name').sort({createdAt:-1}).limit(100);
  res.json({products});
});
exports.createProduct = asyncHandler(async(req,res) => {
  if (!['provider','admin'].includes(req.user.role)) return res.status(403).json({message:'Only approved resource sellers or administrators can create resource listings.'});
  const {name,category,description='',price,unit='unit',stock,images=[]}=req.body;
  if(!name||!Number.isFinite(Number(price))||Number(price)<0||!Number.isFinite(Number(stock))||Number(stock)<0) return res.status(400).json({message:'Name, valid price, and valid stock are required.'});
  const product=await Product.create({name,category,description,price:Number(price),unit,stock:Number(stock),images,seller:req.user._id});
  res.status(201).json({product});
});
exports.listings = asyncHandler(async(req,res) => {
  const filter={status:'active'};
  if(req.query.search) filter.cropName={$regex:escapeRegex(String(req.query.search).slice(0,80)),$options:'i'};
  const listings=await CropListing.find(filter).populate('farmer','name').sort({createdAt:-1}).limit(100);
  res.json({listings});
});
exports.createListing = asyncHandler(async(req,res) => {
  if(req.user.role!=='farmer') return res.status(403).json({message:'Only farmers can create crop listings.'});
  const {cropName,variety='',description='',availableQuantity,unit='kg',pricePerUnit,minimumOrderQuantity=1,harvestDate,location={},images=[],biddingEnabled=false}=req.body;
  if(!cropName||!Number.isFinite(Number(availableQuantity))||Number(availableQuantity)<=0||!Number.isFinite(Number(pricePerUnit))||Number(pricePerUnit)<0) return res.status(400).json({message:'Crop name, positive quantity, and valid price are required.'});
  const listing=await CropListing.create({farmer:req.user._id,cropName,variety,description,availableQuantity:Number(availableQuantity),unit,pricePerUnit:Number(pricePerUnit),minimumOrderQuantity:Number(minimumOrderQuantity),harvestDate:harvestDate||null,location,images,biddingEnabled:Boolean(biddingEnabled)});
  res.status(201).json({listing});
});
exports.createBid = asyncHandler(async(req,res) => {
  if(req.user.role!=='customer') return res.status(403).json({message:'Only customers can submit bids.'});
  const listing=await CropListing.findOne({_id:req.params.id,status:'active'});
  if(!listing) return res.status(404).json({message:'Crop listing not found.'});
  if(!listing.biddingEnabled) return res.status(400).json({message:'Bidding is not enabled for this listing.'});
  const offeredPrice=Number(req.body.offeredPrice), quantity=Number(req.body.quantity);
  if(!Number.isFinite(offeredPrice)||offeredPrice<0||!Number.isFinite(quantity)||quantity<=0||quantity>listing.availableQuantity) return res.status(400).json({message:'Enter a valid offer price and quantity.'});
  const bid=await Bid.create({listing:listing._id,farmer:listing.farmer,customer:req.user._id,offeredPrice,quantity,message:String(req.body.message||'').slice(0,1000)});
  res.status(201).json({bid});
});
exports.myBids = asyncHandler(async(req,res) => {
  const filter=req.user.role==='farmer'?{farmer:req.user._id}:{customer:req.user._id};
  const bids=await Bid.find(filter).populate('listing','cropName pricePerUnit unit').populate('customer','name').populate('farmer','name').sort({createdAt:-1}).limit(100);
  res.json({bids});
});
exports.respondBid = asyncHandler(async(req,res) => {
  const bid=await Bid.findOne({_id:req.params.id,farmer:req.user._id,status:'pending'});
  if(!bid) return res.status(404).json({message:'Pending bid not found.'});
  const action=req.body.action;
  if(!['accept','reject'].includes(action)) return res.status(400).json({message:'Action must be accept or reject.'});
  if(action==='reject'){bid.status='rejected';await bid.save();return res.json({bid});}
  const listing=await CropListing.findOne({_id:bid.listing,farmer:req.user._id,status:'active'});
  if(!listing||listing.availableQuantity<bid.quantity) return res.status(409).json({message:'Listing is no longer available in the requested quantity.'});
  // Atomic decrement prevents two accepted bids from overselling the same listing.
  const updated=await CropListing.findOneAndUpdate({_id:listing._id,farmer:req.user._id,status:'active',availableQuantity:{$gte:bid.quantity}},{$inc:{availableQuantity:-bid.quantity}},{new:true});
  if(!updated) return res.status(409).json({message:'The listing quantity changed. Refresh and try again.'});
  const total=Number((bid.offeredPrice*bid.quantity).toFixed(2));
  try {
    const order=await Order.create({customer:bid.customer,items:[{listingType:'crop',listing:listing._id,seller:listing.farmer,nameSnapshot:listing.cropName,quantity:bid.quantity,unit:listing.unit,unitPrice:bid.offeredPrice,subtotal:total}],totalAmount:total,paymentMethod:'COD',status:'placed'});
    bid.status='accepted';bid.order=order._id;await bid.save();
    if(updated.availableQuantity===0){updated.status='sold_out';await updated.save();}
    return res.json({message:'Bid accepted and COD order created.',bid,order});
  } catch(err) { await CropListing.updateOne({_id:listing._id},{$inc:{availableQuantity:bid.quantity}}); throw err; }
});
exports.createOrder = asyncHandler(async(req,res) => {
  if(req.user.role!=='customer') return res.status(403).json({message:'Only customers can place orders.'});
  const {items,deliveryAddress={}}=req.body;
  if(!Array.isArray(items)||items.length===0||items.length>30) return res.status(400).json({message:'Provide between 1 and 30 order items.'});
  if(!deliveryAddress.name||!deliveryAddress.phone||!deliveryAddress.addressLine||!deliveryAddress.district||!deliveryAddress.state) return res.status(400).json({message:'Name, phone, address, district, and state are required for delivery.'});
  const reservations=[];
  try {
    let orderItems=[],total=0;
    for(const input of items){
      const quantity=Number(input.quantity);
      if(!Number.isFinite(quantity)||quantity<=0) throw Object.assign(new Error('Every item needs a positive quantity.'),{statusCode:400});
      const type=input.listingType;
      if(type==='product'){
        const item=await Product.findOneAndUpdate({_id:input.listing,active:true,stock:{$gte:quantity},seller:{$ne:req.user._id}},{$inc:{stock:-quantity}},{new:true});
        if(!item) throw Object.assign(new Error('A resource product is unavailable or has insufficient stock.'),{statusCode:409});
        reservations.push({type:'product',id:item._id,quantity});
        const subtotal=Number((item.price*quantity).toFixed(2));total+=subtotal;
        orderItems.push({listingType:'product',listing:item._id,seller:item.seller,nameSnapshot:item.name,quantity,unit:item.unit,unitPrice:item.price,subtotal});
      } else if(type==='crop'){
        const item=await CropListing.findOneAndUpdate({_id:input.listing,status:'active',availableQuantity:{$gte:quantity},farmer:{$ne:req.user._id},$expr:{$lte:['$minimumOrderQuantity',quantity]}},{$inc:{availableQuantity:-quantity}},{new:true});
        if(!item) throw Object.assign(new Error('A crop listing is unavailable, has insufficient quantity, or is below its minimum order quantity.'),{statusCode:409});
        reservations.push({type:'crop',id:item._id,quantity});
        const subtotal=Number((item.pricePerUnit*quantity).toFixed(2));total+=subtotal;
        orderItems.push({listingType:'crop',listing:item._id,seller:item.farmer,nameSnapshot:item.cropName,quantity,unit:item.unit,unitPrice:item.pricePerUnit,subtotal});
        if(item.availableQuantity===0){item.status='sold_out';await item.save();}
      } else throw Object.assign(new Error('Unsupported listing type.'),{statusCode:400});
    }
    const order=await Order.create({customer:req.user._id,items:orderItems,deliveryAddress,totalAmount:Number(total.toFixed(2)),paymentMethod:'COD',status:'placed'});
    res.status(201).json({message:'Cash-on-delivery order placed.',order});
  } catch(err) {
    for(const r of reservations){
      if(r.type==='product') await Product.updateOne({_id:r.id},{$inc:{stock:r.quantity}});
      if(r.type==='crop') await CropListing.updateOne({_id:r.id,status:{$ne:'removed'}},{$inc:{availableQuantity:r.quantity},$set:{status:'active'}});
    }
    throw err;
  }
});
exports.myOrders = asyncHandler(async(req,res) => {
  const filter=req.user.role==='admin'?{}:{customer:req.user._id};
  const orders=await Order.find(filter).sort({createdAt:-1}).limit(100);
  res.json({orders});
});
exports.updateOrderStatus = asyncHandler(async(req,res) => {
  const order=await Order.findById(req.params.id);
  if(!order) return res.status(404).json({message:'Order not found.'});
  const owns=order.items.some(i=>String(i.seller)===String(req.user._id));
  if(req.user.role!=='admin'&&!owns) return res.status(403).json({message:'You cannot update this order.'});
  const allowed={placed:['confirmed','cancelled'],confirmed:['dispatched','cancelled'],dispatched:['delivered'],delivered:[],cancelled:[]};
  if(!allowed[order.status]?.includes(req.body.status)) return res.status(400).json({message:'Invalid order status transition.'});
  order.status=req.body.status;
  if(order.status==='delivered') order.paymentStatus='pending';
  await order.save();res.json({order});
});
exports.services = asyncHandler(async(req,res)=>{const services=await Service.find({active:true}).populate('provider','name').sort({createdAt:-1}).limit(100);res.json({services});});
exports.createService = asyncHandler(async(req,res)=>{if(!['provider','admin'].includes(req.user.role))return res.status(403).json({message:'Only service providers can create services.'});const {name,category,description='',price,pricingUnit='booking',serviceArea={}}=req.body;if(!name||!Number.isFinite(Number(price))||Number(price)<0)return res.status(400).json({message:'Service name and valid price are required.'});const service=await Service.create({provider:req.user._id,name,category,description,price:Number(price),pricingUnit,serviceArea});res.status(201).json({service});});
exports.createBooking = asyncHandler(async(req,res)=>{if(req.user.role!=='customer')return res.status(403).json({message:'Only customers can book services.'});const {service:serviceId,requestedDate,timeSlot='',location='',notes=''}=req.body;const service=await Service.findOne({_id:serviceId,active:true});if(!service)return res.status(404).json({message:'Service not found.'});const date=new Date(requestedDate);if(!requestedDate||Number.isNaN(date.getTime())||date<new Date())return res.status(400).json({message:'Choose a valid future booking date.'});const conflict=await Booking.exists({provider:service.provider,requestedDate:date,status:{$in:['requested','accepted']},timeSlot});if(timeSlot&&conflict)return res.status(409).json({message:'This provider already has a booking for that time slot.'});const booking=await Booking.create({customer:req.user._id,service:service._id,provider:service.provider,requestedDate:date,timeSlot,location,notes,totalAmount:service.price});res.status(201).json({booking});});
exports.myBookings = asyncHandler(async(req,res)=>{const filter=req.user.role==='admin'?{}:req.user.role==='provider'?{provider:req.user._id}:{customer:req.user._id};const bookings=await Booking.find(filter).populate('service','name price pricingUnit').populate('customer','name').populate('provider','name').sort({createdAt:-1}).limit(100);res.json({bookings});});
exports.updateBooking = asyncHandler(async(req,res)=>{const booking=await Booking.findById(req.params.id);if(!booking)return res.status(404).json({message:'Booking not found.'});if(req.user.role!=='admin'&&String(booking.provider)!==String(req.user._id))return res.status(403).json({message:'Only the provider or an administrator can update this booking.'});const allowed=req.user.role==='admin'?['accepted','rejected','completed','cancelled']:['accepted','rejected','completed'];if(!allowed.includes(req.body.status))return res.status(400).json({message:'Invalid booking status.'});booking.status=req.body.status;await booking.save();res.json({booking});});
function escapeRegex(value){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
