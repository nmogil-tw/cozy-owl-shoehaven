import { AnalyticsBrowser } from '@segment/analytics-next';

// Initialize analytics with the write key from environment variables
const writeKey = import.meta.env.VITE_SEGMENT_WRITE_KEY;
if (!writeKey) {
  console.error('Segment write key is not configured');
}

export const analytics = AnalyticsBrowser.load({ 
  writeKey: writeKey || '' // Provide empty string as fallback to prevent undefined errors
});

export const identifyUser = async (formData: any) => {
  console.log('Identifying user:', formData.email);
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
  formData: any,
  orderId: string,
  totalAmount: number,
  cartItems: any[]
) => {
  console.log('Tracking order completed:', orderId);
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