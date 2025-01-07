import { AnalyticsBrowser } from '@segment/analytics-next';
import { CheckoutFormData, CartItem } from "@/types/checkout";

// Initialize analytics with the write key
const analytics = AnalyticsBrowser.load({ 
  writeKey: 'YOUR_SEGMENT_WRITE_KEY' // Replace this with your actual Segment write key
});

export const identifyUser = async (formData: CheckoutFormData) => {
  await analytics.identify(formData.email, {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    address: {
      street: formData.address,
      city: formData.city,
      state: formData.state,
      postalCode: formData.zipCode
    }
  });
};

export const trackOrderCompleted = async (
  formData: CheckoutFormData,
  orderId: string,
  totalAmount: number,
  cartItems: CartItem[]
) => {
  await analytics.track('Order Completed', {
    orderId,
    revenue: totalAmount,
    items: cartItems,
    shipping: {
      street: formData.address,
      city: formData.city,
      state: formData.state,
      postalCode: formData.zipCode
    }
  }, { userId: formData.email });
};