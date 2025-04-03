
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
    const { leadId } = await req.json();
    
    if (!leadId) {
      throw new Error("Lead ID is required");
    }

    // Initialize Supabase client with service role key for admin actions
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
    
    if (leadError || !lead) {
      throw new Error(`Failed to fetch lead data: ${leadError?.message}`);
    }

    // Send confirmation email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "QuoteLinker <quotes@quotelinker.com>",
      to: [lead.email],
      subject: "Your Insurance Quote Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a56db;">Thank You for Your Quote Request!</h1>
          <p>Hello ${lead.first_name},</p>
          <p>We have received your request for a life insurance quote. Our team will review your information and get back to you shortly with personalized options that meet your needs.</p>
          <h2 style="color: #374151;">Your Quote Details:</h2>
          <ul>
            <li><strong>Coverage Amount:</strong> ${lead.coverage_amount}</li>
            <li><strong>Age:</strong> ${lead.age}</li>
            <li><strong>Gender:</strong> ${lead.gender}</li>
            <li><strong>Tobacco Use:</strong> ${lead.tobacco_use}</li>
          </ul>
          <p>We will contact you via your preferred method: ${lead.preferred_contact === 'both' ? 'Email and Phone' : lead.preferred_contact}.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-top: 24px;">
            <p style="margin: 0;">If you have any questions in the meantime, please reply to this email or contact our support team at <a href="mailto:support@quotelinker.com">support@quotelinker.com</a>.</p>
          </div>
          <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
            © ${new Date().getFullYear()} QuoteLinker LLC. All rights reserved.<br>
            This message was sent to ${lead.email} because you requested a quote from our website.
          </p>
        </div>
      `
    });

    if (emailError) {
      throw new Error(`Failed to send email: ${JSON.stringify(emailError)}`);
    }

    // Update lead with email sent status
    const { error: updateError } = await supabase
      .from('leads')
      .update({ email_sent: true })
      .eq('id', leadId);
    
    if (updateError) {
      throw new Error(`Failed to update lead with email status: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, emailId: emailData?.id }),
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
