import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    // Get environment variables with correct names as per Twilio docs
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const apiKey = Deno.env.get('TWILIO_API_KEY_SID')  // Changed from TWILIO_API_KEY
    const apiSecret = Deno.env.get('TWILIO_API_KEY_SECRET')  // Changed from TWILIO_API_SECRET
    const serviceSid = Deno.env.get('TWILIO_CONVERSATIONS_SERVICE_SID')

    if (!accountSid || !apiKey || !apiSecret || !serviceSid) {
      console.error('Missing required environment variables')
      throw new Error('Missing required environment variables')
    }

    // Generate a random identity if none is provided
    const identity = `user_${Math.random().toString(36).substring(7)}`

    console.log('Creating token with:', { accountSid, apiKey, identity, serviceSid })

    // Create an access token with the correct parameters
    const token = new AccessToken(
      accountSid,
      apiKey,
      apiSecret,
      { identity: identity }
    )

    // Create a Conversations Grant (changed from ChatGrant)
    const conversationGrant = new AccessToken.ConversationsGrant({
      serviceSid: serviceSid
    })
    
    // Add grant to token
    token.addGrant(conversationGrant)

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