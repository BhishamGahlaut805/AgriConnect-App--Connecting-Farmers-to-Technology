import { createContext, useContext, useState, useEffect } from "react";
import { cartService } from "../API/AgrimarketService";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartService.get();
      setCart(response.data);
    } catch (error) {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (listingId, qty) => {
    const response = await cartService.addItem(listingId, qty);
    setCart(response.data);
    return response;
  };

  const updateCartItem = async (listingId, qty) => {
    const response = await cartService.updateItem(listingId, qty);
    setCart(response.data);
    return response;
  };

  const removeFromCart = async (listingId) => {
    const response = await cartService.removeItem(listingId);
    setCart(response.data);
    return response;
  };

  const clearCart = async () => {
    await cartService.clear();
    setCart(null);
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
