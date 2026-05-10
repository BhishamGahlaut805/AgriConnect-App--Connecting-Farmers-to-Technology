// validations/orderValidations.js
const Joi = require("joi");
const { AppError } = require("../Utils/AppError");

// Common validation patterns
const phonePattern = /^[6-9]\d{9}$/;
const pincodePattern = /^\d{6}$/;
const orderIdPattern = /^ORD\d{6}[A-Z0-9]{4}$/;

// Address validation schema
const addressValidation = Joi.object({
  fullName: Joi.string().min(2).max(100).required().trim().messages({
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 2 characters long",
    "string.max": "Full name cannot exceed 100 characters",
  }),

  phone: Joi.string().pattern(phonePattern).required().messages({
    "string.pattern.base": "Please enter a valid 10-digit Indian phone number",
    "string.empty": "Phone number is required",
  }),

  email: Joi.string().email().required().lowercase().trim().messages({
    "string.email": "Please enter a valid email address",
    "string.empty": "Email is required",
  }),

  street: Joi.string().min(5).max(200).required().trim().messages({
    "string.empty": "Street address is required",
    "string.min": "Street address must be at least 5 characters long",
    "string.max": "Street address cannot exceed 200 characters",
  }),

  landmark: Joi.string().max(100).trim().optional().allow(""),

  city: Joi.string().min(2).max(50).required().trim().messages({
    "string.empty": "City is required",
    "string.min": "City must be at least 2 characters long",
    "string.max": "City cannot exceed 50 characters",
  }),

  state: Joi.string().min(2).max(50).required().trim().messages({
    "string.empty": "State is required",
    "string.min": "State must be at least 2 characters long",
    "string.max": "State cannot exceed 50 characters",
  }),

  pincode: Joi.string().pattern(pincodePattern).required().messages({
    "string.pattern.base": "Please enter a valid 6-digit pincode",
    "string.empty": "Pincode is required",
  }),

  type: Joi.string().valid("home", "work", "other").default("home"),

  isDefault: Joi.boolean().default(false),
});

// Order item validation
const orderItemValidation = Joi.object({
  product: Joi.string().hex().length(24).required().messages({
    "string.hex": "Invalid product ID format",
    "string.length": "Product ID must be 24 characters long",
  }),

  listing: Joi.string().hex().length(24).required().messages({
    "string.hex": "Invalid listing ID format",
    "string.length": "Listing ID must be 24 characters long",
  }),

  quantity: Joi.number().integer().min(1).max(1000).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be a whole number",
    "number.min": "Quantity must be at least 1",
    "number.max": "Quantity cannot exceed 1000",
  }),

  price: Joi.number().precision(2).min(0.01).max(1000000).required().messages({
    "number.base": "Price must be a number",
    "number.min": "Price must be at least 0.01",
    "number.max": "Price cannot exceed 1,000,000",
  }),
});

// Create Order Validation
const createOrderValidation = Joi.object({
  shippingAddressId: Joi.string().hex().length(24).required().messages({
    "string.empty": "Shipping address is required",
    "string.hex": "Invalid address ID format",
    "string.length": "Address ID must be 24 characters long",
  }),

  paymentMethod: Joi.string()
    .valid("credit_card", "debit_card", "upi", "net_banking", "cod")
    .required()
    .messages({
      "any.only":
        "Payment method must be one of: credit_card, debit_card, upi, net_banking, cod",
      "string.empty": "Payment method is required",
    }),

  notes: Joi.string().max(500).trim().optional().allow("").messages({
    "string.max": "Notes cannot exceed 500 characters",
  }),

  totalAmountFrontend: Joi.number().positive().required().messages({
    "number.base": "Total amount must be a number",
    "number.positive": "Total amount must be greater than zero",
    "any.required": "Total amount is required",
  }),

  items: Joi.array()
    .items(orderItemValidation)
    .min(1)
    .max(20)
    .optional()
    .messages({
      "array.min": "Order must contain at least one item",
      "array.max": "Order cannot contain more than 20 items",
    }),
});

// Update Order Status Validation
const updateOrderStatusValidation = Joi.object({
  orderStatus: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    )
    .optional()
    .messages({
      "any.only": "Invalid order status",
    }),

  deliveryStatus: Joi.string()
    .valid(
      "pending",
      "picked_up",
      "in_transit",
      "out_for_delivery",
      "delivered",
      "failed",
    )
    .optional()
    .messages({
      "any.only": "Invalid delivery status",
    }),

  trackingNumber: Joi.string().max(50).trim().optional().allow("").messages({
    "string.max": "Tracking number cannot exceed 50 characters",
  }),

  cancellationReason: Joi.string()
    .max(200)
    .trim()
    .when("orderStatus", {
      is: "cancelled",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "string.max": "Cancellation reason cannot exceed 200 characters",
      "any.required": "Cancellation reason is required when cancelling order",
    }),
})
  .or("orderStatus", "deliveryStatus", "trackingNumber")
  .messages({
    "object.missing":
      "At least one field (orderStatus, deliveryStatus, or trackingNumber) is required",
  });

// Cancel Order Validation
const cancelOrderValidation = Joi.object({
  reason: Joi.string().min(10).max(200).required().trim().messages({
    "string.empty": "Cancellation reason is required",
    "string.min": "Cancellation reason must be at least 10 characters long",
    "string.max": "Cancellation reason cannot exceed 200 characters",
  }),
});

// Verify OTP Validation
const verifyOTPValidation = Joi.object({
  otpCode: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.empty": "OTP code is required",
    "string.length": "OTP must be 6 digits long",
    "string.pattern.base": "OTP must contain only numbers",
  }),
});

// Order Query Validation (for listing orders)
const orderQueryValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "Limit must be a number",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),

  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    )
    .optional()
    .messages({
      "any.only": "Invalid status filter",
    }),

  startDate: Joi.date().iso().max("now").optional().messages({
    "date.format": "Start date must be in ISO format (YYYY-MM-DD)",
    "date.max": "Start date cannot be in the future",
  }),

  endDate: Joi.date()
    .iso()
    .min(Joi.ref("startDate"))
    .max("now")
    .optional()
    .messages({
      "date.format": "End date must be in ISO format (YYYY-MM-DD)",
      "date.min": "End date cannot be before start date",
      "date.max": "End date cannot be in the future",
    }),

  sortBy: Joi.string()
    .valid("createdAt", "totalAmount", "updatedAt")
    .default("createdAt")
    .messages({
      "any.only":
        "Sort field must be one of: createdAt, totalAmount, updatedAt",
    }),

  sortOrder: Joi.string().valid("asc", "desc").default("desc").messages({
    "any.only": "Sort order must be asc or desc",
  }),
});

// Tracking Update Validation
const trackingUpdateValidation = Joi.object({
  location: Joi.string().min(3).max(100).required().trim().messages({
    "string.empty": "Location is required",
    "string.min": "Location must be at least 3 characters long",
    "string.max": "Location cannot exceed 100 characters",
  }),

  status: Joi.string()
    .valid("picked_up", "in_transit", "out_for_delivery", "delivered", "failed")
    .required()
    .messages({
      "any.only": "Invalid tracking status",
      "string.empty": "Status is required",
    }),

  notes: Joi.string().max(200).trim().optional().allow("").messages({
    "string.max": "Notes cannot exceed 200 characters",
  }),

  estimatedTime: Joi.date().iso().min("now").optional().messages({
    "date.format": "Estimated time must be in ISO format",
    "date.min": "Estimated time cannot be in the past",
  }),
});

// Validation middleware factory
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: property === "query", // Allow unknown query params
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        type: detail.type,
      }));

      const validationError = AppError.validationError(
        "Validation failed",
      ).addContext({ errors: errorDetails });

      return next(validationError);
    }

    // Replace req[property] with validated value
    req[property] = value;
    next();
  };
};

module.exports = {
  createOrderValidation,
  updateOrderStatusValidation,
  cancelOrderValidation,
  verifyOTPValidation,
  orderQueryValidation,
  trackingUpdateValidation,
  addressValidation,
  validate,
};
