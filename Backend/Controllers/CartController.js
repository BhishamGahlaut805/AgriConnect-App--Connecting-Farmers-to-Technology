const Cart = require("../Models/Cart");
const Product = require("../Models/Product");
const Listing = require("../Models/Listing");

// const Cart = require("../Models/Cart");

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: "items.product",
        model: "Listing",
        populate: {
          path: "product",
          model: "Product",
          select:
            "title category price unit stock images description status isActive",
        },
        select:
          "pricePerUnit availableQty minOrderQty description status isActive farmer",
      })
      .populate("user", "name email")
      .lean();

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        cart: { user: req.user._id, items: [] },
      });
    }

    // Keep only valid, active items
    const validItems = cart.items.filter(
      (item) => item?.product?.isActive && item?.product?.product?.isActive
    );

    // Format timestamps and flatten nested structure
    const formattedItems = validItems.map((item) => ({
      _id: item._id,
      qty: item.qty,
      addedAt: item.addedAt
        ? new Date(item.addedAt).toISOString()
        : new Date(cart.createdAt).toISOString(),
      updatedAt: item.updatedAt
        ? new Date(item.updatedAt).toISOString()
        : new Date(cart.updatedAt).toISOString(),
      listing: {
        _id: item.product._id,
        pricePerUnit: item.product.pricePerUnit,
        availableQty: item.product.availableQty,
        minOrderQty: item.product.minOrderQty,
        description: item.product.description,
        status: item.product.status,
        isActive: item.product.isActive,
      },
      product: {
        _id: item.product.product._id,
        title: item.product.product.title,
        category: item.product.product.category,
        price: item.product.product.price,
        unit: item.product.product.unit,
        stock: item.product.product.stock,
        images: item.product.product.images,
        description: item.product.product.description,
        status: item.product.product.status,
        isActive: item.product.product.isActive,
      },
    }));

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      cart: {
        _id: cart._id,
        user: {
          _id: cart.user._id,
          name: cart.user.name,
          email: cart.user.email,
        },
        items: formattedItems,
        createdAt: new Date(cart.createdAt).toISOString(),
        updatedAt: new Date(cart.updatedAt).toISOString(),
      },
    });
  } catch (err) {
    console.error("Get Cart Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
      error: err.message,
    });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { listingId, qty = 1 } = req.body;
    console.log("Add Item called with ID:", listingId, "qty:", qty);

    let listing = null;
    let product = null;

    // --- 1️⃣ Try finding in Listing ---
    listing = await Listing.findById(listingId).populate("product");

    // --- 2️⃣ If not found in Listing, try finding in Product ---
    if (!listing) {
      product = await Product.findById(listingId);
      if (!product) {
        return res.status(404).json({ message: "Item not found" });
      }

      // If found only in product, check if there’s a listing for it
      listing = await Listing.findOne({ product: product._id, isActive: true });
    } else {
      product = listing.product;
    }

    if (!product || product.status === "inactive" || !product.isActive) {
      return res
        .status(400)
        .json({ message: "Product is inactive or unavailable" });
    }

    // --- 3️⃣ Check available quantity ---
    const availableQty = listing ? listing.availableQty : product.stock;
    if (availableQty < qty) {
      return res.status(400).json({ message: "Not enough quantity available" });
    }

    // --- 4️⃣ Reduce stock in both listing and product ---
    if (listing) {
      listing.availableQty -= qty;
      if (listing.availableQty <= 0) {
        listing.availableQty = 0;
        listing.status = "soldout";
        listing.isActive = false;
      }
      await listing.save();
    }

    product.stock = Math.max(product.stock - qty, 0);
    await product.save();

    // --- 5️⃣ Update user’s cart ---
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Use listingId if it exists, else use productId
    const targetId = listing ? listing._id : product._id;
    const existingItemIndex = cart.items.findIndex(
      (it) => String(it.product) === String(targetId)
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].qty += qty;
    } else {
      cart.items.push({ product: targetId, qty });
    }

    await cart.save();
    await cart.populate({
      path: "items.product",
      model: "Listing",
      populate: {
        path: "product",
        model: "Product",
        select: "title category price unit stock images description",
      },
    });

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      cart,
    });
  } catch (err) {
    console.error("Add Item Error:", err);
    res.status(500).json({ message: "Failed to add item to cart" });
  }
};


exports.updateItem = async (req, res) => {
  try {
    const { listingId, qty } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart empty" });

    const idx = cart.items.findIndex(
      (it) => String(it.product) === String(listingId)
    );
    if (idx < 0)
      return res.status(404).json({ message: "Item not found in cart" });

    const listing = await Listing.findById(listingId).populate("product");
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const prevQty = cart.items[idx].qty;

    // Adjust stock only if quantity changes
    if (qty !== prevQty) {
      const diff = qty - prevQty;

      // If increasing, ensure enough stock
      if (diff > 0 && listing.availableQty < diff) {
        return res
          .status(400)
          .json({ message: "Not enough stock to increase quantity" });
      }

      // Update stock in listing and product
      listing.availableQty -= diff;
      listing.availableQty = Math.max(listing.availableQty, 0);
      listing.status = listing.availableQty <= 0 ? "soldout" : "active";
      listing.isActive = listing.availableQty > 0;
      await listing.save();

      const product = await Product.findById(listing.product._id);
      if (product) {
        product.stock = Math.max(product.stock - diff, 0);
        await product.save();
      }
    }

    // Update cart
    if (qty <= 0) cart.items.splice(idx, 1);
    else cart.items[idx].qty = qty;

    await cart.save();
    await cart.populate("items.product");
    res.json(cart);
  } catch (err) {
    console.error("Update Item Error:", err);
    res.status(500).json({ message: "Failed to update cart item" });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { listingId } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart empty" });

    const idx = cart.items.findIndex(
      (it) => String(it.product) === String(listingId)
    );
    if (idx < 0)
      return res.status(404).json({ message: "Item not found in cart" });

    const removedItem = cart.items[idx];
    const listing = await Listing.findById(listingId).populate("product");

    // Restore quantity back to stock since item removed from cart
    if (listing && removedItem.qty > 0) {
      listing.availableQty += removedItem.qty;
      listing.status = "active";
      listing.isActive = true;
      await listing.save();

      const product = await Product.findById(listing.product._id);
      if (product) {
        product.stock += removedItem.qty;
        await product.save();
      }
    }

    // Remove from cart
    cart.items.splice(idx, 1);
    await cart.save();
    await cart.populate("items.product");
    res.json(cart);
  } catch (err) {
    console.error("Remove Item Error:", err);
    res.status(500).json({ message: "Failed to remove item from cart" });
  }
};
