const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/Agrimarket/v1/api`;

// Helper: get token from localStorage
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
}

async function handleApiCall(url, options = {}) {
  try {
    console.log("Fetching URL:", url, "Options:", options);
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      throw new Error("Authentication required. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Address API call failed:", error);
    throw error;
  }
}

export const AddressService = {
  // Create new address
  createAddress: async (addressData) => {
    return handleApiCall(`${BASE_URL}/addresses`, {
      method: "POST",
      body: JSON.stringify(addressData),
    });
  },

  // Get all addresses of the logged-in user
  getUserAddresses: async () => {
    return handleApiCall(`${BASE_URL}/addresses`);
  },

  // Get default address
  getDefaultAddress: async () => {
    return handleApiCall(`${BASE_URL}/addresses/default`);
  },

  // Get address by ID
  getAddressById: async (addressId) => {
    return handleApiCall(`${BASE_URL}/addresses/${addressId}`);
  },

  // Update an address
  updateAddress: async (addressId, addressData) => {
    return handleApiCall(`${BASE_URL}/addresses/${addressId}`, {
      method: "PUT",
      body: JSON.stringify(addressData),
    });
  },

  // Delete an address (soft delete)
  deleteAddress: async (addressId) => {
    return handleApiCall(`${BASE_URL}/addresses/${addressId}`, {
      method: "DELETE",
    });
  },
};

export default AddressService;
