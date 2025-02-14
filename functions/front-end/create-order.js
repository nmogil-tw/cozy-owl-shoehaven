exports.handler = async function(context, event, callback) {
    try {
      const client = require('airtable');
      const base = new client({apiKey: context.AIRTABLE_API_KEY}).base(context.AIRTABLE_BASE_ID);
      
      const { items, totalAmount, customerId, email, phone } = event;
      
      const newOrder = await base('Orders').create({
        "items": JSON.stringify(items),
        "total_amount": totalAmount,
        "shipping_status": "pending",
        "customer_id": customerId,
        "email": email,
        "phone": phone
      });
      
      callback(null, {
        success: true,
        data: newOrder
      });
      
    } catch (error) {
      callback(error);
    }
  };