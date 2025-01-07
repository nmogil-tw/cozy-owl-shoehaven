import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { formData, orderData, cartItems, totalAmount } = await req.json()
    
    console.log('Received order data:', { formData, orderData, cartItems, totalAmount })

    const response = await fetch('https://noah-demos-2840.twil.io/send-to-segment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({
        formData,
        orderData,
        cartItems,
        totalAmount
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to send data to Segment: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Successfully sent data to Segment:', result)

    return new Response(
      JSON.stringify({ success: true, result }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
})