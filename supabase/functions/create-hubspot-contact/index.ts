
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
    const { 
      leadId, 
      firstName, 
      lastName, 
      email, 
      phone, 
      age, 
      gender, 
      tobaccoUse, 
      coverageAmount, 
      preferredContact, 
      zipCode 
    } = await req.json();
    
    if (!leadId) {
      throw new Error("Lead ID is required");
    }

    // Initialize Supabase client with service role key for admin actions
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create contact in HubSpot
    const hubspotResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${hubspotApiKey}`
      },
      body: JSON.stringify({
        properties: {
          firstname: firstName,
          lastname: lastName,
          email: email,
          phone: phone,
          age: age,
          gender: gender,
          tobacco_use: tobaccoUse,
          coverage_amount: coverageAmount,
          preferred_contact_method: preferredContact,
          zip: zipCode,
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
