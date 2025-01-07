import { AnalyticsBrowser, Analytics } from '@segment/analytics-next';
import { supabase } from "@/integrations/supabase/client";
import { CheckoutFormData, CartItem } from "@/types/checkout";

const getSegmentKey = async () => {
  const { data, error } = await supabase.functions.invoke('get-secret', {
    body: { name: 'SEGMENT_WRITE_KEY' }
  });
  if (error) throw error;
  return data.secret;
};

const initializeAnalytics = async () => {
  const writeKey = await getSegmentKey();
  const [analytics] = await AnalyticsBrowser.load({ writeKey });
  return analytics;
};

let analyticsPromise = initializeAnalytics();

export const identifyUser = async (formData: CheckoutFormData) => {
  const analytics = await analyticsPromise;
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
  const analytics = await analyticsPromise;
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