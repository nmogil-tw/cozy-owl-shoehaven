import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutFormData, CartItem } from "@/types/checkout";
import { AnalyticsBrowser } from '@segment/analytics-next';

const getSegmentKey = async () => {
  const { data, error } = await supabase.functions.invoke('get-secret', {
    body: { name: 'SEGMENT_WRITE_KEY' }
  });
  if (error) throw error;
  return data.secret;
};

const initializeAnalytics = async () => {
  const writeKey = await getSegmentKey();
  return AnalyticsBrowser.load({ writeKey });
};

let analyticsPromise = initializeAnalytics();

export const useCheckout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: CheckoutFormData) => {
    setLoading(true);

    try {
      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];
      const totalAmount = cartItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );

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

      const analytics = await analyticsPromise;

      await analytics.identify({
        userId: formData.email,
        type: 'identify',
        traits: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        }
      });

      await analytics.track({
        userId: formData.email,
        type: 'track',
        event: 'Order Completed',
        properties: {
          orderId: orderData.id,
          revenue: totalAmount,
          items: cartItems,
          shipping: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
          }
        }
      });

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