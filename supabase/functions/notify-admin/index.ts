// Standard Deno import for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('re_PHquR1a9_BR2yMQZBMyNbSaFCraXkbcny')

serve(async (req: Request): Promise<Response> => {
  try {
    // This is the data sent from the Supabase Webhook
    const { record } = await req.json()

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'BrokeBoy Tees <onboarding@resend.dev>',
        to: 'abishekvh@gmail.com',
        subject: `🔥 NEW ORDER: #${record.id.slice(0,8).toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; border: 5px solid black; padding: 20px;">
            <h1 style="text-transform: uppercase;">New Drop Copped!</h1>
            <p><strong>Order ID:</strong> ${record.id}</p>
            <p><strong>Customer Phone:</strong> ${record.phone_number}</p>
            <p><strong>Amount:</strong> ₹${record.total_amount}</p>
            <p><strong>Address:</strong> ${record.shipping_address}</p>
          </div>
        `,
      }),
    })

    const result = await res.json()
    
    return new Response(JSON.stringify({ message: "Notification sent", result }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})