exports.handler = async function(context, event, callback) {
    try {
      const AccessToken = require('twilio').jwt.AccessToken;
      const ChatGrant = AccessToken.ChatGrant;
      
      // Create a Chat Grant for this token
      const chatGrant = new ChatGrant({
        serviceSid: context.TWILIO_CHAT_SERVICE_SID,
      });
      
      // Create a unique ID for the client
      const identity = `customer-${Date.now()}`;
      
      // Create an access token
      const token = new AccessToken(
        context.ACCOUNT_SID,
        context.TWILIO_API_KEY,
        context.TWILIO_API_SECRET,
        { identity }
      );
      
      // Add the chat grant to the token
      token.addGrant(chatGrant);
      
      callback(null, {
        success: true,
        data: {
          token: token.toJwt()
        }
      });
      
    } catch (error) {
      callback(error);
    }
  };