export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateProduct = (product) => {
  const errors = {};

  if (!product.name || product.name.trim().length < 3) {
    errors.name = "Product name must be at least 3 characters";
  }

  if (
    !product.pricePerUnit ||
    isNaN(product.pricePerUnit) ||
    product.pricePerUnit <= 0
  ) {
    errors.pricePerUnit = "Price must be a positive number";
  }

  if (
    !product.availableQty ||
    isNaN(product.availableQty) ||
    product.availableQty <= 0
  ) {
    errors.availableQty = "Quantity must be a positive number";
  }

  return Object.keys(errors).length === 0 ? null : errors;
};
