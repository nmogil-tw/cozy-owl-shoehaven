import { AnalyticsBrowser } from '@segment/analytics-next';

// Initialize analytics with the write key from environment variables
const writeKey = import.meta.env.VITE_SEGMENT_WRITE_KEY;
if (!writeKey) {
  console.error('Segment write key is not configured. Please check your .env file.');
}

console.log('Initializing Segment analytics with write key:', writeKey);

// Initialize the analytics object as early as possible
export const analytics = AnalyticsBrowser.load({ 
  writeKey: writeKey || '', // Provide empty string as fallback to prevent undefined errors
}).catch(error => {
  console.error('Failed to load analytics:', error);
  // Return a mock analytics object to prevent app crashes
  return {
    identify: () => Promise.resolve(),
    track: () => Promise.resolve(),
    page: () => Promise.resolve(),
  };
});

export const identifyUser = async (formData: any) => {
  try {
    console.log('Identifying user:', formData.email);
    const analyticsInstance = await analytics;
    await analyticsInstance.identify(formData.email, {
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
    // We throw the error to handle it in the UI
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
    const analyticsInstance = await analytics;
    await analyticsInstance.track('Order Completed', {
      orderId,
      revenue: totalAmount,
      products: cartItems.map(item => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    // We throw the error to handle it in the UI
    throw error;
  }
};

// Track page views
export const trackPageView = async (pageName: string, properties: Record<string, any> = {}) => {
  try {
    console.log('Tracking page view:', pageName);
    const analyticsInstance = await analytics;
    await analyticsInstance.page(pageName, properties);
  } catch (error) {
    console.error('Error tracking page view:', error);
    // We throw the error to handle it in the UI
    throw error;
  }
};