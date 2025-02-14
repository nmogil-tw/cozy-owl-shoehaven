exports.handler = async function(context, event, callback) {
    try {
      const client = require('airtable');
      const base = new client({apiKey: context.AIRTABLE_API_KEY}).base(context.AIRTABLE_BASE_ID);
      
      const { firstName, lastName, email, phone, address, city, state, zipCode } = event;
      
      // Check if customer exists
      const existingRecords = await base('Customers').select({
        filterByFormula: `{email} = '${email}'`
      }).firstPage();
      
      if (existingRecords.length > 0) {
        return callback(null, {
          success: true,
          data: existingRecords[0]
        });
      }
      
      // Create new customer
      const newCustomer = await base('Customers').create({
        "first_name": firstName,
        "last_name": lastName,
        "email": email,
        "phone": phone,
        "address": address,
        "city": city,
        "state": state,
        "zip_code": zipCode
      });
      
      callback(null, {
        success: true,
        data: newCustomer
      });
      
    } catch (error) {
      callback(error);
    }
  };