const Crop = require('../models/Crop');
const Farm = require('../models/Farm');
const asyncHandler = require('../utils/asyncHandler');
exports.list = asyncHandler(async (req, res) => {
  const filter = { owner: req.user._id };
  if (req.query.farm) filter.farm = req.query.farm;
  const crops = await Crop.find(filter).populate('farm', 'farmName location').sort({ createdAt: -1 }).limit(300);
  res.json({ crops });
});
exports.create = asyncHandler(async (req, res) => {
  const { farm, cropName, variety = '', sowingDate, expectedHarvestDate, growthStage, status, notes = '' } = req.body;
  if (!farm || !cropName) return res.status(400).json({ message: 'Farm and crop name are required.' });
  const ownedFarm = await Farm.findOne({ _id: farm, owner: req.user._id });
  if (!ownedFarm) return res.status(400).json({ message: 'Choose a farm belonging to your account.' });
  if (sowingDate && expectedHarvestDate && new Date(expectedHarvestDate) < new Date(sowingDate)) return res.status(400).json({ message: 'Expected harvest date cannot be before sowing date.' });
  const crop = await Crop.create({ owner: req.user._id, farm, cropName, variety, sowingDate: sowingDate || null, expectedHarvestDate: expectedHarvestDate || null, growthStage, status, notes });
  await crop.populate('farm', 'farmName location');
  res.status(201).json({ crop });
});
exports.getOne = asyncHandler(async (req, res) => {
  const crop = await Crop.findOne({ _id: req.params.id, owner: req.user._id }).populate('farm', 'farmName location');
  if (!crop) return res.status(404).json({ message: 'Crop not found.' });
  res.json({ crop });
});
exports.update = asyncHandler(async (req, res) => {
  const allowed = ['cropName', 'variety', 'sowingDate', 'expectedHarvestDate', 'growthStage', 'status', 'notes'];
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const existing = await Crop.findOne({ _id: req.params.id, owner: req.user._id });
  if (!existing) return res.status(404).json({ message: 'Crop not found.' });
  const start = update.sowingDate ?? existing.sowingDate;
  const end = update.expectedHarvestDate ?? existing.expectedHarvestDate;
  if (start && end && new Date(end) < new Date(start)) return res.status(400).json({ message: 'Expected harvest date cannot be before sowing date.' });
  Object.assign(existing, update);
  await existing.save();
  await existing.populate('farm', 'farmName location');
  res.json({ crop: existing });
});
exports.remove = asyncHandler(async (req, res) => {
  const crop = await Crop.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!crop) return res.status(404).json({ message: 'Crop not found.' });
  res.json({ message: 'Crop deleted.' });
});
