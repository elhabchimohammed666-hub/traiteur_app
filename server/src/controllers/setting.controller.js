const Setting = require('../models/Setting');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getPublicSettings = asyncHandler(async (req, res) => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({});
  }

  res.status(200).json({
    success: true,
    data: {
      businessName: setting.businessName,
      phone: setting.phone,
      email: setting.email,
      address: setting.address,
      whatsappNumber: setting.whatsappNumber,
      currency: setting.currency,
      minNoticeDays: setting.minNoticeDays,
      depositPercent: setting.depositPercent,
      taxRate: setting.taxRate,
      deliveryZones: setting.deliveryZones,
      cancellationPolicy: setting.cancellationPolicy,
      social: setting.social
    }
  });
});

const getSettings = asyncHandler(async (req, res) => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({});
  }

  res.status(200).json({
    success: true,
    data: setting
  });
});

const updateSettings = asyncHandler(async (req, res) => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = new Setting(req.body);
  } else {
    Object.assign(setting, req.body);
  }

  await setting.save();

  res.status(200).json({
    success: true,
    message: 'Paramètres mis à jour avec succès.',
    data: setting
  });
});

module.exports = {
  getPublicSettings,
  getSettings,
  updateSettings
};
