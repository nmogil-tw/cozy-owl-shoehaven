import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { AccessToken } from "https://esm.sh/twilio@4.19.0/jwt"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting token generation process');
    
    const { ChatGrant } = AccessToken;
    
    console.log('Successfully imported Twilio dependencies');

    // Check for required environment variables
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const apiKey = Deno.env.get('TWILIO_API_KEY');
    const apiSecret = Deno.env.get('TWILIO_API_SECRET');
    const serviceSid = Deno.env.get('TWILIO_CONVERSATIONS_SERVICE_SID');

    // Log environment variable status (without exposing values)
    console.log('Environment variables status:', {
      accountSid: !!accountSid,
      apiKey: !!apiKey,
      apiSecret: !!apiSecret,
      serviceSid: !!serviceSid
    });

    if (!accountSid || !apiKey || !apiSecret || !serviceSid) {
      throw new Error('Missing required Twilio configuration');
    }

    // Generate a random identity
    const identity = crypto.randomUUID();
    console.log('Generated identity:', identity);

    try {
      // Create Access Token
      const token = new AccessToken(
        accountSid,
        apiKey,
        apiSecret,
        { identity }
      );

      // Create a Chat Grant and add it to the token
      const conversationsGrant = new ChatGrant({
        serviceSid: serviceSid,
      });

      token.addGrant(conversationsGrant);
      const generatedToken = token.toJwt();

      console.log('Successfully generated token');

      return new Response(
        JSON.stringify({ token: generatedToken }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      )
    } catch (tokenError) {
      console.error('Error generating Twilio token:', tokenError);
      throw new Error(`Failed to generate Twilio token: ${tokenError.message}`);
    }
  } catch (error) {
    console.error('Error in token generation process:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate token',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})