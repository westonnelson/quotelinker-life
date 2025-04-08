
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
    
    console.log(`[${new Date().toISOString()}] Starting email sending process for: ${email}`);
    console.log(`[${new Date().toISOString()}] Resend API key status: ${resendApiKey ? "Available" : "Missing"}`);
    
    if (!email) {
      throw new Error("Email is required");
    }

    if (!resendApiKey) {
      throw new Error("Resend API key is not configured");
    }

    console.log(`[${new Date().toISOString()}] Preparing to send confirmation email to: ${email}`);
    
    // Send confirmation email using Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: "QuoteLinker <notifications@quotelinker.com>",
        to: email,
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
    
    console.log(`[${new Date().toISOString()}] Email API response status: ${emailResponse.status}`);
    
    let responseText;
    let responseData;
    
    try {
      // Try to parse as JSON first
      responseData = await emailResponse.json();
      responseText = JSON.stringify(responseData);
      console.log(`[${new Date().toISOString()}] Email API response parsed as JSON:`, responseText);
    } catch (parseError) {
      // If that fails, get as text
      try {
        responseText = await emailResponse.text();
        console.log(`[${new Date().toISOString()}] Email API raw response text:`, responseText);
      } catch (textError) {
        responseText = "Could not read response";
        console.error(`[${new Date().toISOString()}] Could not read email API response:`, textError);
      }
    }
    
    // Check if the response was successful
    if (!emailResponse.ok) {
      console.error(`[${new Date().toISOString()}] Email API error (${emailResponse.status}):`, responseText);
      throw new Error(`Email API error (${emailResponse.status}): ${responseText}`);
    }

    console.log(`[${new Date().toISOString()}] Email sent successfully to ${email}, message ID: ${responseData?.id || "unknown"}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: responseData?.id || "unknown" 
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Email sending error:`, error);
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
