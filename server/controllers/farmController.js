const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const asyncHandler = require('../utils/asyncHandler');
exports.list = asyncHandler(async (req, res) => {
  const farms = await Farm.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(200);
  res.json({ farms });
});
exports.create = asyncHandler(async (req, res) => {
  const { farmName, area, areaUnit, location = {}, soilType = '', irrigationType = '', description = '' } = req.body;
  if (!farmName || !Number.isFinite(Number(area)) || Number(area) <= 0) return res.status(400).json({ message: 'Farm name and a positive area are required.' });
  const farm = await Farm.create({ owner: req.user._id, farmName, area: Number(area), areaUnit, location, soilType, irrigationType, description });
  res.status(201).json({ farm });
});
exports.getOne = asyncHandler(async (req, res) => {
  const farm = await Farm.findOne({ _id: req.params.id, owner: req.user._id });
  if (!farm) return res.status(404).json({ message: 'Farm not found.' });
  res.json({ farm });
});
exports.update = asyncHandler(async (req, res) => {
  const allowed = ['farmName', 'area', 'areaUnit', 'location', 'soilType', 'irrigationType', 'description'];
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  if (update.area !== undefined && (!Number.isFinite(Number(update.area)) || Number(update.area) <= 0)) return res.status(400).json({ message: 'Area must be a positive number.' });
  const farm = await Farm.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, update, { new: true, runValidators: true });
  if (!farm) return res.status(404).json({ message: 'Farm not found.' });
  res.json({ farm });
});
exports.remove = asyncHandler(async (req, res) => {
  const farm = await Farm.findOne({ _id: req.params.id, owner: req.user._id });
  if (!farm) return res.status(404).json({ message: 'Farm not found.' });
  if (await Crop.exists({ farm: farm._id, owner: req.user._id })) return res.status(409).json({ message: 'Delete or reassign this farm’s crop records before deleting the farm.' });
  await farm.deleteOne();
  res.json({ message: 'Farm deleted.' });
});
