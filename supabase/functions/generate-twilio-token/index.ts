import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Twilio } from "https://esm.sh/twilio@4.19.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Generating Twilio token...");
    
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const apiKey = Deno.env.get('TWILIO_API_KEY');
    const apiSecret = Deno.env.get('TWILIO_API_SECRET');
    const serviceSid = Deno.env.get('TWILIO_CONVERSATIONS_SERVICE_SID');

    if (!accountSid || !apiKey || !apiSecret || !serviceSid) {
      console.error("Missing required environment variables");
      throw new Error('Missing required environment variables');
    }

    const client = new Twilio(apiKey, apiSecret, { accountSid });
    const identity = `customer-${Date.now()}`;

    console.log("Creating access token...");
    const accessToken = new Twilio.jwt.AccessToken(accountSid, apiKey, apiSecret, {
      identity,
    });

    const chatGrant = new Twilio.jwt.AccessToken.ChatGrant({
      serviceSid,
    });

    accessToken.addGrant(chatGrant);
    const token = accessToken.toJwt();

    console.log("Token generated successfully");

    return new Response(
      JSON.stringify({ token }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error generating token:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      },
    );
  }
});