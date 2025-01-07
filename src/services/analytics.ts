import { AnalyticsBrowser } from '@segment/analytics-next';

// Initialize analytics with the write key from environment variables
const writeKey = import.meta.env.VITE_SEGMENT_WRITE_KEY;
if (!writeKey) {
  console.error('Segment write key is not configured. Please check your .env file.');
}

console.log('Initializing Segment analytics with write key:', writeKey);

export const analytics = AnalyticsBrowser.load({ 
  writeKey: writeKey || '' // Provide empty string as fallback to prevent undefined errors
});

export const identifyUser = async (formData: any) => {
  try {
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
  } catch (error) {
    console.error('Error identifying user:', error);
    throw error;
  }
};

export const trackOrderCompleted = async (
  formData: any,
  orderId: string,
  totalAmount: number,
  cartItems: any[]
) => {
  try {
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
  } catch (error) {
    console.error('Error tracking order:', error);
    throw error;
  }
};