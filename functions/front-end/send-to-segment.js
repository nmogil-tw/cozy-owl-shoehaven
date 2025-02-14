exports.handler = async function(context, event, callback) {
    try {
      const Analytics = require('@segment/analytics-node');
      const analytics = new Analytics({ writeKey: context.SEGMENT_WRITE_KEY });
      
      const { formData, orderData, cartItems, totalAmount } = event;
      
      await analytics.track({
        userId: orderData.customer_id,
        event: 'Order Completed',
        properties: {
          orderId: orderData.id,
          total: totalAmount,
          items: cartItems,
          shipping: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          }
        }
      });
      
      callback(null, {
        success: true
      });
      
    } catch (error) {
      callback(error);
    }
  };