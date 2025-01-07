import { AnalyticsBrowser } from '@segment/analytics-next';
import { CheckoutFormData, CartItem } from "@/types/checkout";

// Initialize analytics with the write key
const analytics = AnalyticsBrowser.load({ 
  writeKey: import.meta.env.VITE_SEGMENT_WRITE_KEY // Use environment variable
});

export const identifyUser = async (formData: CheckoutFormData) => {
  await analytics.identify(formData.email, {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zipCode,
  });
};

export const trackOrderCompleted = async (
  orderId: string,
  totalAmount: number,
  cartItems: CartItem[]
) => {
  await analytics.track('Order Completed', {
    orderId,
    revenue: totalAmount,
    products: cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }))
  });
};