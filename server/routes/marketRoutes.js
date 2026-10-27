const router=require('express').Router();const c=require('../controllers/marketController');const {protect,allowRoles}=require('../middleware/auth');
router.get('/products',c.products);router.get('/listings',c.listings);router.get('/services',c.services);
router.post('/products',protect,allowRoles('provider','admin'),c.createProduct);router.post('/listings',protect,allowRoles('farmer'),c.createListing);
router.post('/listings/:id/bids',protect,allowRoles('customer'),c.createBid);router.get('/bids/mine',protect,allowRoles('farmer','customer'),c.myBids);router.patch('/bids/:id/respond',protect,allowRoles('farmer'),c.respondBid);
router.post('/orders',protect,allowRoles('customer'),c.createOrder);router.get('/orders/mine',protect,allowRoles('customer','admin'),c.myOrders);router.patch('/orders/:id/status',protect,allowRoles('farmer','provider','admin'),c.updateOrderStatus);
router.post('/services',protect,allowRoles('provider','admin'),c.createService);router.post('/bookings',protect,allowRoles('customer'),c.createBooking);router.get('/bookings/mine',protect,allowRoles('customer','provider','admin'),c.myBookings);router.patch('/bookings/:id/status',protect,allowRoles('provider','admin'),c.updateBooking);
module.exports=router;
