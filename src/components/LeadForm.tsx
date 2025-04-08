
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Custom imports
import { leadFormSchema, initialFormData, formSteps } from '@/utils/formSchemas';
import { useLeadFormSubmission } from '@/hooks/useLeadFormSubmission';
import FormStepNavigation from '@/components/forms/FormStepNavigation';
import BasicInfoStep from '@/components/forms/BasicInfoStep';
import CoverageDetailsStep from '@/components/forms/CoverageDetailsStep';
import ContactPreferencesStep from '@/components/forms/ContactPreferencesStep';

export const LeadForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { isSubmitting, submitError, submitForm, setSubmitError } = useLeadFormSubmission();

  const form = useForm({
    resolver: zodResolver(leadFormSchema),
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
    let fieldsToValidate: (keyof typeof initialFormData)[] = [];
    
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

  const onSubmit = async (data: typeof initialFormData) => {
    if (currentStep < formSteps.length - 1) {
      handleNextStep();
      return;
    }
    
    await submitForm(data);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep form={form} />;
      case 1:
        return <CoverageDetailsStep form={form} />;
      case 2:
        return <ContactPreferencesStep form={form} />;
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
            
            <FormStepNavigation steps={formSteps} currentStep={currentStep} />
            
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
