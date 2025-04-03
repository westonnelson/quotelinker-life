
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, firstName, lastName, email } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    // Send confirmation email using Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: "quotes@quotelinker.com",
        to: email,
        subject: "Your Life Insurance Quote Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4F46E5;">Thank you for your quote request, ${firstName}!</h2>
            <p>We've received your life insurance quote request and our team is reviewing your information.</p>
            <p>One of our licensed insurance professionals will contact you shortly to discuss your options.</p>
            <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">Reference Number: ${leadId}</p>
              <p style="margin: 5px 0 0;">Please keep this for your records.</p>
            </div>
            <p>If you have any questions in the meantime, please reply to this email.</p>
            <p>Best regards,<br>The QuoteLinker Team</p>
          </div>
        `
      })
    });

    const emailData = await emailResponse.json();
    
    if (!emailResponse.ok) {
      throw new Error(`Email API error: ${JSON.stringify(emailData)}`);
    }

    return new Response(
      JSON.stringify({ success: true, messageId: emailData.id }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});
