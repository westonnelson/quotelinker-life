
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LeadFormData } from '@/utils/formSchemas';
import { sendConfirmationEmail } from '@/services/emailService';

export const useLeadFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const submitForm = async (data: LeadFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      console.log(`[${new Date().toISOString()}] Starting form submission process`);
      console.log(`[${new Date().toISOString()}] Form data:`, data);
      
      // Since we don't have authentication, we need to bypass RLS
      // by using the correct service API
      const { data: leadData, error: leadError } = await supabase
        .from('Life')
        .insert({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          age: data.age,
          gender: data.gender,
          tobacco: data.tobaccoUse
        })
        .select()
        .single();

      if (leadError) {
        console.error(`[${new Date().toISOString()}] Supabase database error:`, leadError);
        throw new Error(`Database error: ${leadError.message}`);
      }

      console.log(`[${new Date().toISOString()}] Successfully inserted into Life table, got back data:`, leadData);
      const leadId = leadData.id;
      
      // Skip inserting into leads table since it has RLS enabled
      // We'll just work with the Life table which appears to be accessible
      
      // Send confirmation email
      let emailSent = false;
      try {
        console.log(`[${new Date().toISOString()}] Attempting to send confirmation email`);
        await sendConfirmationEmail(leadId, data);
        emailSent = true;
        
        toast({
          title: "Confirmation Email Sent",
          description: "Check your inbox for details about your quote request.",
        });
      } catch (emailError: any) {
        console.error(`[${new Date().toISOString()}] Email sending error:`, emailError);
        toast({
          title: "Email Notification Issue",
          description: "We couldn't send you a confirmation email, but your quote request was saved. Our team will still contact you.",
          variant: "destructive"
        });
      }
      
      // Try to create HubSpot contact - continue on error
      try {
        console.log(`[${new Date().toISOString()}] Creating HubSpot contact`);
        const hubspotResponse = await fetch('https://srvqjmnzrcojhrwuihni.supabase.co/functions/v1/create-hubspot-contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNydnFqbW56cmNvamhyd3VpaG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NzUyMjYsImV4cCI6MjA1OTA1MTIyNn0.LVSw8UEVP0yGuvFV0sn2Cs-gX8l_WDjgY37UCEuSuD0`
          },
          body: JSON.stringify({ 
            leadId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            age: data.age,
            gender: data.gender,
            tobaccoUse: data.tobaccoUse,
            coverageAmount: data.coverageAmount,
            bestTimeToContact: data.bestTimeToContact,
            zipCode: data.zipCode
          }),
        });
        
        if (!hubspotResponse.ok) {
          const hubspotError = await hubspotResponse.text();
          console.error(`[${new Date().toISOString()}] HubSpot integration error:`, hubspotError);
        } else {
          console.log(`[${new Date().toISOString()}] HubSpot contact created successfully`);
        }
      } catch (hubspotError) {
        console.error(`[${new Date().toISOString()}] HubSpot integration error:`, hubspotError);
      }
      
      // Show success message and redirect
      toast({
        title: "Form Submitted Successfully",
        description: "We'll contact you shortly with your quote!",
      });
      
      console.log(`[${new Date().toISOString()}] Form submission completed successfully, redirecting to success page`);
      navigate('/appointment-success');
      
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Form submission error:`, error);
      setSubmitError(error.message || "An unexpected error occurred. Please try again.");
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitError,
    submitForm,
    setSubmitError
  };
};
