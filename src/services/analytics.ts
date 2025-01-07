// Type definition for the global analytics object
declare global {
  interface Window {
    analytics: any;
  }
}

console.log('Initializing analytics service');

const isAnalyticsBlocked = () => {
  try {
    return window.analytics === undefined;
  } catch {
    return true;
  }
};

export const identifyUser = async (formData: any) => {
  if (isAnalyticsBlocked()) {
    console.log('Analytics blocked by browser: skipping identify user');
    return;
  }

  try {
    console.log('Identifying user:', formData.email);
    window.analytics.identify(formData.email, {
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
    console.log('Analytics error (possibly blocked):', error);
  }
};

export const trackOrderCompleted = async (
  formData: any,
  orderId: string,
  totalAmount: number,
  cartItems: any[]
) => {
  if (isAnalyticsBlocked()) {
    console.log('Analytics blocked by browser: skipping order tracking');
    return;
  }

  try {
    console.log('Tracking order completed:', orderId);
    window.analytics.track('Order Completed', {
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
    console.log('Analytics error (possibly blocked):', error);
  }
};

export const trackPageView = async (pageName: string, properties: Record<string, any> = {}) => {
  if (isAnalyticsBlocked()) {
    console.log('Analytics blocked by browser: skipping page view tracking');
    return;
  }

  try {
    console.log('Tracking page view:', pageName);
    window.analytics.page(pageName, properties);
  } catch (error) {
    console.log('Analytics error (possibly blocked):', error);
  }
};