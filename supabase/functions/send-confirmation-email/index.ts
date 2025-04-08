
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
    
    console.log("Starting email sending process for:", email);
    
    if (!email) {
      throw new Error("Email is required");
    }

    if (!resendApiKey) {
      throw new Error("Resend API key is not configured");
    }

    console.log("Sending confirmation email using Resend API");
    
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
        bcc: ["support@quotelinker.com", "admin@quotelinker.com"], // Multiple BCC recipients for better reliability
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
    
    console.log("Email API response status:", emailResponse.status);
    
    // More detailed error handling for the response
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email API error response:", errorText);
      throw new Error(`Email API error (${emailResponse.status}): ${errorText}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully, response:", emailData);

    // Also send admin notification email
    try {
      const adminEmailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: "quotes@quotelinker.com",
          to: "admin@quotelinker.com", // Primary admin email
          subject: "New Lead Notification - Life Insurance Quote",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://lovable-uploads.s3.amazonaws.com/5d933709-1084-4ee3-ac2e-9e3866cf7eeb.png" alt="QuoteLinker Logo" style="width: 120px; height: auto;">
              </div>
              <h2 style="color: #0056b3;">New Lead Notification</h2>
              <p>A new life insurance quote request has been submitted.</p>
              <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Lead ID:</strong> ${leadId}</p>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <p>Please log in to the admin dashboard to view complete details.</p>
            </div>
          `
        })
      });
      
      if (!adminEmailResponse.ok) {
        console.error("Admin notification email failed:", await adminEmailResponse.text());
      } else {
        console.log("Admin notification email sent successfully");
      }
    } catch (adminEmailError) {
      // Log but don't fail the overall request if admin email fails
      console.error("Error sending admin notification email:", adminEmailError);
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
