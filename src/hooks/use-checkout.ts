import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutFormData, CartItem } from "@/types/checkout";
import { identifyUser, trackOrderCompleted } from "@/services/analytics";

export const useCheckout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const calculateTotalAmount = (cartItems: CartItem[]): number => {
    return cartItems.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    );
  };

  const createOrder = async (formData: CheckoutFormData, cartItems: CartItem[], totalAmount: number) => {
    const { data: orderData, error } = await supabase.from("orders").insert({
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zipCode,
      items: cartItems,
      total_amount: totalAmount,
    }).select().single();

    if (error) throw error;
    return orderData;
  };

  const handleSubmit = async (formData: CheckoutFormData) => {
    setLoading(true);

    try {
      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];
      const totalAmount = calculateTotalAmount(cartItems);
      
      const orderData = await createOrder(formData, cartItems, totalAmount);
      
      await identifyUser(formData);
      await trackOrderCompleted(formData, orderData.id, totalAmount, cartItems);

      localStorage.removeItem("cart");
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase.",
      });
      navigate("/");
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error placing order",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSubmit,
  };
};