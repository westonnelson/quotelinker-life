
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const hubspotApiKey = Deno.env.get("HUBSPOT_API_KEY")!;

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

    // Create contact in HubSpot
    const hubspotResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${hubspotApiKey}`
      },
      body: JSON.stringify({
        properties: {
          firstname: lead.first_name,
          lastname: lead.last_name,
          email: lead.email,
          phone: lead.phone,
          age: lead.age,
          gender: lead.gender,
          tobacco_use: lead.tobacco_use,
          coverage_amount: lead.coverage_amount,
          preferred_contact_method: lead.preferred_contact,
          zip: lead.zip_code,
          lifecyclestage: "lead",
          lead_source: "website",
          lead_status: "new"
        }
      })
    });

    const hubspotData = await hubspotResponse.json();
    
    if (!hubspotResponse.ok) {
      throw new Error(`HubSpot API error: ${JSON.stringify(hubspotData)}`);
    }

    // Update lead with HubSpot ID
    const { error: updateError } = await supabase
      .from('leads')
      .update({ hubspot_id: hubspotData.id })
      .eq('id', leadId);
    
    if (updateError) {
      throw new Error(`Failed to update lead with HubSpot ID: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, hubspotId: hubspotData.id }),
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
