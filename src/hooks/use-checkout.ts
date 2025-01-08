import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutFormData, CartItem, Customer } from "@/types/checkout";

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

  const findOrCreateCustomer = async (formData: CheckoutFormData): Promise<Customer> => {
    console.log("Searching for existing customer with email:", formData.email);
    
    // First, try to find existing customer by email
    const { data: existingCustomer, error: findError } = await supabase
      .from("customers")
      .select()
      .eq("email", formData.email)
      .maybeSingle();

    if (findError) {
      console.error("Error finding customer:", findError);
      throw findError;
    }

    if (existingCustomer) {
      console.log("Found existing customer:", existingCustomer);
      return existingCustomer as Customer;
    }

    console.log("No existing customer found, creating new one");
    // If no existing customer, create new one
    const { data: newCustomer, error: createError } = await supabase
      .from("customers")
      .insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating customer:", createError);
      throw createError;
    }
    
    console.log("Created new customer:", newCustomer);
    return newCustomer as Customer;
  };

  const createOrder = async (customer: Customer, cartItems: CartItem[], totalAmount: number) => {
    const { data: orderData, error } = await supabase
      .from("orders")
      .insert({
        customer_id: customer.id,
        items: cartItems,
        total_amount: totalAmount,
      })
      .select()
      .single();

    if (error) throw error;
    console.log("Created new order:", orderData);
    return orderData;
  };

  const checkShippingStatus = async (orderId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-shipping-status', {
        body: { orderId }
      });

      if (error) throw error;
      return data.status;
    } catch (error) {
      console.error('Error checking shipping status:', error);
      throw error;
    }
  };

  const sendToSegment = async (formData: CheckoutFormData, orderData: any, cartItems: CartItem[], totalAmount: number) => {
    const { error } = await supabase.functions.invoke('send-to-segment', {
      body: {
        formData,
        orderData,
        cartItems,
        totalAmount
      }
    });

    if (error) {
      console.error('Error sending data to Segment:', error);
      // We don't throw here to avoid blocking the checkout process
    }
  };

  const handleSubmit = async (formData: CheckoutFormData) => {
    setLoading(true);
    console.log("Starting checkout process with form data:", formData);

    try {
      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];
      const totalAmount = calculateTotalAmount(cartItems);
      
      // Find or create customer
      const customer = await findOrCreateCustomer(formData);
      
      // Create order with customer ID
      const orderData = await createOrder(customer, cartItems, totalAmount);

      // Send data to Segment via Edge Function
      await sendToSegment(formData, orderData, cartItems, totalAmount);

      // Set up shipping status check
      const checkStatus = async () => {
        try {
          const status = await checkShippingStatus(orderData.id);
          toast({
            title: "Order Status Updated",
            description: `Your order is now ${status}`,
          });
        } catch (error) {
          console.error('Error checking shipping status:', error);
        }
      };

      // Check status every 20 minutes
      const statusInterval = setInterval(checkStatus, 20 * 60 * 1000);
      
      // Clear interval after 1 hour (when order should be delivered)
      setTimeout(() => {
        clearInterval(statusInterval);
      }, 60 * 60 * 1000);

      localStorage.removeItem("cart");
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase. We'll keep you updated on the shipping status.",
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
    checkShippingStatus,
  };
};