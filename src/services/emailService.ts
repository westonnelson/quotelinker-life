
import { LeadFormData } from "@/utils/formSchemas";
import { useToast } from "@/hooks/use-toast";

export const sendConfirmationEmail = async (
  leadId: string,
  data: LeadFormData
): Promise<boolean> => {
  console.log(`[${new Date().toISOString()}] Starting email sending process`);
  
  try {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Sending confirmation email to:`, data.email);
    
    const emailResponse = await fetch('https://srvqjmnzrcojhrwuihni.supabase.co/functions/v1/send-confirmation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        leadId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      }),
    });
    
    const endTime = Date.now();
    console.log(`[${new Date().toISOString()}] Email API request completed in ${endTime - startTime}ms`);

    // Always try to get the response text first for better debugging
    const responseText = await emailResponse.text();
    console.log(`[${new Date().toISOString()}] Raw email API response:`, responseText);
    
    let responseData;
    try {
      // Only parse as JSON if it looks like JSON
      if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
        responseData = JSON.parse(responseText);
        console.log(`[${new Date().toISOString()}] Email API response parsed as JSON:`, responseData);
      } else {
        console.log(`[${new Date().toISOString()}] Response is not JSON, using as is`);
        responseData = { message: responseText };
      }
    } catch (parseError) {
      console.error(`[${new Date().toISOString()}] Failed to parse response as JSON:`, parseError);
      responseData = { error: "Invalid response format", text: responseText };
    }
    
    if (!emailResponse.ok) {
      console.error(`[${new Date().toISOString()}] Email sending failed with status:`, emailResponse.status, "Response:", responseData);
      throw new Error(`Failed to send confirmation email: ${
        responseData?.error || responseData?.message || responseData?.text || 'Server error'
      }`);
    }
    
    console.log(`[${new Date().toISOString()}] Email sent successfully:`, responseData);
    
    return true;
  } catch (emailError: any) {
    console.error(`[${new Date().toISOString()}] Email sending error:`, emailError);
    return false;
  }
};
