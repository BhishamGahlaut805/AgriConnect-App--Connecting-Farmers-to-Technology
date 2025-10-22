const Address = require("../models/Address");

// Create a new address
exports.createAddress = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming req.user is set by auth middleware
    const addressData = { ...req.body, user: userId };

    const address = new Address(addressData);
    await address.save();

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: address,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all addresses for the logged-in user
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    const addresses = await Address.getUserAddresses(userId);

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single address by ID
exports.getAddressById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const address = await Address.findOne({
      _id: id,
      user: userId,
      "metadata.isActive": true,
    });

    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    res.status(200).json({ success: true, data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update an address
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const address = await Address.findOneAndUpdate(
      { _id: id, user: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Address updated", data: address });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Soft-delete an address
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const address = await Address.findOneAndUpdate(
      { _id: id, user: userId },
      { "metadata.isActive": false },
      { new: true }
    );

    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    res.status(200).json({ success: true, message: "Address deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get default address
exports.getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const address = await Address.getDefaultAddress(userId);

    res.status(200).json({ success: true, data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
