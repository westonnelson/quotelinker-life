
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

    // Skip HubSpot if API key is not configured
    if (!hubspotApiKey) {
      console.log("HubSpot API key not configured, skipping HubSpot integration");
      return new Response(
        JSON.stringify({ success: true, message: "HubSpot integration skipped" }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
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

    // Properly handle JSON parsing errors
    let hubspotData;
    try {
      hubspotData = await hubspotResponse.json();
    } catch (parseError) {
      console.error("Failed to parse HubSpot API response:", parseError);
      // Get the response text to debug
      const responseText = await hubspotResponse.text();
      console.log("Response text:", responseText);
      throw new Error(`HubSpot API response parsing error: ${parseError.message}. Response: ${responseText.substring(0, 200)}`);
    }
    
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
    console.error("HubSpot integration error:", error);
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
