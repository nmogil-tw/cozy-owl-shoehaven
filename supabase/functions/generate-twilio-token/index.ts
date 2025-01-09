import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { AccessToken } from "npm:twilio@4.19.0/lib/jwt/AccessToken.js"

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
    // Get environment variables
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const apiKeySid = Deno.env.get('TWILIO_API_KEY')
    const apiKeySecret = Deno.env.get('TWILIO_API_SECRET')
    const serviceSid = Deno.env.get('TWILIO_CONVERSATIONS_SERVICE_SID')

    if (!accountSid || !apiKeySid || !apiKeySecret || !serviceSid) {
      console.error('Missing required environment variables')
      throw new Error('Missing required environment variables')
    }

    // Generate a random identity if none is provided
    const identity = `user_${Math.random().toString(36).substring(7)}`

    // Create an access token
    const token = new AccessToken(
      accountSid,
      apiKeySid,
      apiKeySecret,
      { identity: identity }
    )

    // Create a Chat Grant and add it to the token
    const chatGrant = new AccessToken.ChatGrant({
      serviceSid: serviceSid
    })
    token.addGrant(chatGrant)

    // Generate JWT
    const jwt = token.toJwt()

    console.log('Token generated successfully for identity:', identity)
    
    return new Response(
      JSON.stringify({ token: jwt }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error generating token:', error)
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