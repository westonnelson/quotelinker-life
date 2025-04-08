import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Lock, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  age: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 18 && num <= 85;
  }, "Age must be between 18 and 85"),
  gender: z.string().min(1, "Gender is required"),
  tobaccoUse: z.string(),
  coverageAmount: z.string().min(1, "Coverage amount is required"),
  bestTimeToContact: z.string(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
});

type FormData = z.infer<typeof formSchema>;

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  age: '',
  gender: '',
  tobaccoUse: 'no',
  coverageAmount: '$100,000',
  bestTimeToContact: 'morning',
  zipCode: '',
};

const coverageOptions = [
  '$50,000',
  '$100,000',
  '$250,000',
  '$500,000',
  '$1,000,000',
];

const formSteps = [
  { title: 'Basic Info', description: 'Tell us about yourself' },
  { title: 'Coverage Details', description: 'Customize your coverage' },
  { title: 'Contact Preferences', description: 'How should we reach you?' },
];

export const LeadForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialFormData,
    mode: "onTouched",
  });

  const nextStep = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    if (currentStep === 0) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phone'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['age', 'gender', 'tobaccoUse', 'coverageAmount'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['bestTimeToContact', 'zipCode'];
    }
    
    try {
      const result = await form.trigger(fieldsToValidate);
      return result;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  };

  const handleNextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      nextStep();
      setSubmitError(null);
    } else {
      console.log("Form validation failed for current step:", currentStep);
    }
  };

  const sendConfirmationEmail = async (leadId: string, data: FormData): Promise<boolean> => {
    console.log("Starting email sending process");
    
    try {
      const startTime = Date.now();
      console.log("Sending confirmation email to:", data.email);
      
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
      console.log(`Email API request completed in ${endTime - startTime}ms`);

      let responseData;
      try {
        responseData = await emailResponse.json();
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        responseData = { error: "Invalid response format" };
      }
      
      console.log("Full email API response:", responseData);
      
      if (!emailResponse.ok) {
        console.error("Email sending failed with status:", emailResponse.status, "Response:", responseData);
        throw new Error(`Failed to send confirmation email: ${
          responseData?.error || responseData?.message || 'Server error'
        }`);
      }
      
      console.log("Email sent successfully:", responseData);
      
      toast({
        title: "Confirmation Email Sent",
        description: "Check your inbox for details about your quote request.",
      });
      
      return true;
    } catch (emailError: any) {
      console.error("Email sending error:", emailError);
      
      toast({
        title: "Email Notification Issue",
        description: "We couldn't send you a confirmation email, but your quote request was saved. Our team will still contact you.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  const onSubmit = async (data: FormData) => {
    if (currentStep < formSteps.length - 1) {
      handleNextStep();
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      console.log("Starting form submission process");
      
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
        console.error("Supabase database error:", leadError);
        throw new Error(`Database error: ${leadError.message}`);
      }

      console.log("Successfully inserted into Life table, got back data:", leadData);
      const leadId = leadData.id;
      
      try {
        console.log("Attempting to send confirmation email");
        const emailResult = await sendConfirmationEmail(leadId, data);
        console.log("Email sending process completed:", emailResult ? "Success" : "Failed but continuing");
      } catch (emailError) {
        console.error("Completely failed email sending process:", emailError);
      }
      
      try {
        console.log("Creating HubSpot contact");
        const hubspotResponse = await fetch('https://srvqjmnzrcojhrwuihni.supabase.co/functions/v1/create-hubspot-contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
          console.error("HubSpot integration error:", hubspotError);
        } else {
          console.log("HubSpot contact created successfully");
        }
      } catch (hubspotError) {
        console.error("HubSpot integration error:", hubspotError);
      }
      
      toast({
        title: "Form Submitted Successfully",
        description: "We'll contact you shortly with your quote!",
      });
      
      navigate('/appointment-success');
      
    } catch (error: any) {
      console.error("Form submission error:", error);
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

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="firstName">First Name*</FormLabel>
                    <FormControl>
                      <Input
                        id="firstName"
                        placeholder="John"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="lastName">Last Name*</FormLabel>
                    <FormControl>
                      <Input
                        id="lastName"
                        placeholder="Smith"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="email">Email Address*</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.smith@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="phone">Phone Number*</FormLabel>
                  <FormControl>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="age">Age*</FormLabel>
                    <FormControl>
                      <Input
                        id="age"
                        type="number"
                        placeholder="35"
                        min="18"
                        max="85"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Gender*</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4 pt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">Female</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="tobaccoUse"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Tobacco Use in the Last 12 Months?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4 pt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="tobacco-yes" />
                        <Label htmlFor="tobacco-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="tobacco-no" />
                        <Label htmlFor="tobacco-no">No</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverageAmount"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Coverage Amount*</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select coverage amount" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coverageOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="bestTimeToContact"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Best Time to Contact</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col gap-2 pt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="morning" id="time-morning" />
                        <Label htmlFor="time-morning">Morning (8am - 12pm)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="afternoon" id="time-afternoon" />
                        <Label htmlFor="time-afternoon">Afternoon (12pm - 5pm)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="evening" id="time-evening" />
                        <Label htmlFor="time-evening">Evening (5pm - 8pm)</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="zipCode">ZIP Code*</FormLabel>
                  <FormControl>
                    <Input
                      id="zipCode"
                      placeholder="55305"
                      maxLength={10}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-2 text-sm text-gray-500 pt-4">
              <Lock className="h-4 w-4" />
              <p>Your information is secure and will not be shared with third parties.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section id="lead-form" className="py-8 sm:py-12">
      <div className="container-custom max-w-3xl px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-primary px-4 sm:px-6 py-6 text-white">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
              <img 
                src="/lovable-uploads/4a43f3ca-40c9-43b0-b9a5-a2106c990f37.png" 
                alt="QuoteLinker Logo" 
                className="h-8 w-auto invert" 
              />
              <h2 className="text-xl sm:text-2xl font-bold text-center">Get Your Free Life Insurance Quote</h2>
            </div>
            <p className="text-primary-foreground/80 text-center text-sm sm:text-base">Complete the form below to receive your personalized quote</p>
          </div>
          
          <div className="p-4 sm:p-6">
            {submitError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-between mb-6 sm:mb-8">
              {formSteps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex flex-col items-center ${
                    index === currentStep ? "opacity-100" : "opacity-60"
                  }`}
                >
                  <div 
                    className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium ${
                      index < currentStep
                        ? "bg-green-100 text-green-600"
                        : index === currentStep
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-1 sm:mt-2 text-center">
                    <p className="text-xs sm:text-sm font-medium">{step.title}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 hidden md:block">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {renderStep()}
                
                <div className="flex justify-between mt-6 sm:mt-8">
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={isSubmitting}
                      className="text-sm h-9 sm:h-10"
                    >
                      Back
                    </Button>
                  )}
                  
                  <div className={currentStep > 0 ? "ml-auto" : "w-full"}>
                    <Button
                      type="button"
                      className="bg-primary hover:bg-primary-hover text-sm h-9 sm:h-10 w-full sm:w-auto"
                      disabled={isSubmitting}
                      onClick={currentStep < formSteps.length - 1 ? handleNextStep : form.handleSubmit(onSubmit)}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : currentStep < formSteps.length - 1 ? (
                        <div className="flex items-center gap-1">
                          Next Step 
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      ) : (
                        "Get My Quote"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
            
            <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
              <div className="flex flex-col items-center justify-center bg-green-100 text-green-600 p-2 rounded-full">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-medium">Want to speak with an agent?</h3>
                <p className="text-sm text-gray-500">
                  <Link 
                    to="/appointment-success" 
                    className="text-primary hover:underline"
                  >
                    Schedule a call
                  </Link> with one of our licensed insurance experts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadForm;
