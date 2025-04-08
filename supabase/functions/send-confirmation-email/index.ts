
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY");

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
    
    console.log("Sending confirmation email to:", email);
    
    if (!email) {
      throw new Error("Email is required");
    }

    if (!resendApiKey) {
      throw new Error("Resend API key is not configured");
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
        bcc: "support@quotelinker.com", // Add BCC to ensure agent receives a copy
        subject: "Your Life Insurance Quote Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://lovable-uploads.s3.amazonaws.com/5d933709-1084-4ee3-ac2e-9e3866cf7eeb.png" alt="QuoteLinker Logo" style="width: 120px; height: auto;">
            </div>
            <h2 style="color: #0056b3;">Thank you for your quote request, ${firstName}!</h2>
            <p>We've received your life insurance quote request and our team is reviewing your information.</p>
            <p>One of our licensed insurance professionals will contact you shortly to discuss your options.</p>
            <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">Reference Number: ${leadId}</p>
              <p style="margin: 5px 0 0;">Please keep this for your records.</p>
            </div>
            <p>If you have any questions in the meantime, please contact us at support@quotelinker.com</p>
            <p>Want to speak with an agent right away? <a href="https://quotelinker.com/appointment-success" style="color: #0056b3;">Schedule a call</a> with one of our insurance experts.</p>
            <p>Best regards,<br>The QuoteLinker Team</p>
          </div>
        `
      })
    });

    // Properly handle JSON parsing errors
    let emailData;
    try {
      emailData = await emailResponse.json();
    } catch (parseError) {
      console.error("Failed to parse email API response:", parseError);
      // Get the response text to debug
      const responseText = await emailResponse.text();
      console.log("Response text:", responseText);
      throw new Error(`Email API response parsing error: ${parseError.message}. Response: ${responseText.substring(0, 200)}`);
    }
    
    console.log("Email API response status:", emailResponse.status);
    
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
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
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
