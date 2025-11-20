import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    // --- SUPABASE ADMIN SETUP ---
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // --- API KEY AUTHENTICATION ---
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const apiKey = authHeader.replace('Bearer ', '')

    // Hash the provided API key to compare with the stored hash
    const encoder = new TextEncoder()
    const data = encoder.encode(apiKey)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // --- VALIDATE API KEY ---
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('hashed_key', hashedKey)
      .single()

    if (apiKeyError || !apiKeyData) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized: Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const user = { id: apiKeyData.user_id }

    const { url, method } = req
    const { pathname } = new URL(url)

    // --- ROUTING ---
    if (pathname === '/api/invoice' && method === 'POST') {
      const invoiceData = await req.json()

      // --- SAVE INVOICE ---
      const { data, error } = await supabase
        .from('invoices')
        .insert({ ...invoiceData, user_id: user.id })
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to create invoice', error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, data, message: 'Invoice created successfully' }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (pathname === '/api/status' && method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Internal Server Error', error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
