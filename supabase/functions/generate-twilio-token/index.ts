import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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
    const AccessToken = (await import('https://esm.sh/twilio@4.19.0/jwt/AccessToken.js')).default;
    const ChatGrant = AccessToken.ChatGrant;

    // Generate a random identity if none provided
    const identity = crypto.randomUUID();

    console.log('Generating token for identity:', identity);

    const token = new AccessToken(
      Deno.env.get('TWILIO_ACCOUNT_SID') || '',
      Deno.env.get('TWILIO_API_KEY') || '',
      Deno.env.get('TWILIO_API_SECRET') || '',
      { identity }
    );

    // Create a Chat Grant and add it to the token
    const conversationsGrant = new ChatGrant({
      serviceSid: Deno.env.get('TWILIO_CONVERSATIONS_SERVICE_SID'),
    });

    token.addGrant(conversationsGrant);
    const generatedToken = token.toJwt();

    console.log('Token generated successfully');

    return new Response(
      JSON.stringify({ token: generatedToken }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error generating token:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate token' }),
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