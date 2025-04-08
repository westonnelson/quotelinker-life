
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

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  tobaccoUse: string;
  coverageAmount: string;
  preferredContact: string;
  zipCode: string;
};

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  age: '',
  gender: '',
  tobaccoUse: 'no',
  coverageAmount: '$100,000',
  preferredContact: 'email',
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
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const validateCurrentStep = (): boolean => {
    if (currentStep === 0) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return false;
      }
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive"
        });
        return false;
      }
      if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid 10-digit phone number.",
          variant: "destructive"
        });
        return false;
      }
    } else if (currentStep === 1) {
      if (!formData.age || !formData.gender || !formData.coverageAmount) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return false;
      }
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 18 || age > 85) {
        toast({
          title: "Invalid Age",
          description: "Please enter an age between 18 and 85.",
          variant: "destructive"
        });
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.zipCode) {
        toast({
          title: "Missing Information",
          description: "Please enter your ZIP code.",
          variant: "destructive"
        });
        return false;
      }
      if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
        toast({
          title: "Invalid ZIP Code",
          description: "Please enter a valid ZIP code.",
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) return;
    
    if (currentStep < formSteps.length - 1) {
      nextStep();
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      console.log("Starting form submission process");
      
      // First insert into Life table
      console.log("Inserting into Life table with data:", {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        age: formData.age,
        gender: formData.gender,
        tobacco: formData.tobaccoUse
      });
      
      const { data: leadData, error: leadError } = await supabase
        .from('Life')
        .insert({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          age: formData.age,
          gender: formData.gender,
          tobacco: formData.tobaccoUse
        })
        .select()
        .single();

      if (leadError) {
        console.error("Supabase database error:", leadError);
        throw new Error(`Database error: ${leadError.message}`);
      }

      console.log("Successfully inserted into Life table, got back data:", leadData);
      const leadId = leadData.id;
      
      // Send confirmation email
      console.log("Sending confirmation email to:", formData.email);
      const emailResponse = await fetch('/functions/v1/send-confirmation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          leadId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        }),
      });

      const emailResult = await emailResponse.json();
      
      if (!emailResponse.ok) {
        console.error("Email sending failed:", emailResult);
        throw new Error(`Failed to send confirmation email: ${emailResult.error || 'Unknown error'}`);
      } else {
        console.log("Email sent successfully:", emailResult);
      }
      
      // Create HubSpot contact
      console.log("Creating HubSpot contact");
      const hubspotResponse = await fetch('/functions/v1/create-hubspot-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          leadId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          age: formData.age,
          gender: formData.gender,
          tobaccoUse: formData.tobaccoUse,
          coverageAmount: formData.coverageAmount,
          preferredContact: formData.preferredContact,
          zipCode: formData.zipCode
        }),
      });
      
      if (!hubspotResponse.ok) {
        const hubspotError = await hubspotResponse.json();
        console.error("HubSpot integration error:", hubspotError);
        // We don't want to block the user flow if HubSpot fails, just log it
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
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name*</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name*</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address*</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number*</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age*</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Enter your age"
                  min="18"
                  max="85"
                  value={formData.age}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender*</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange('gender', value)}
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
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tobaccoUse">Tobacco Use in the Last 12 Months?</Label>
              <RadioGroup
                value={formData.tobaccoUse}
                onValueChange={(value) => handleSelectChange('tobaccoUse', value)}
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverageAmount">Coverage Amount*</Label>
              <Select 
                value={formData.coverageAmount}
                onValueChange={(value) => handleSelectChange('coverageAmount', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select coverage amount" />
                </SelectTrigger>
                <SelectContent>
                  {coverageOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preferredContact">Preferred Contact Method</Label>
              <RadioGroup
                value={formData.preferredContact}
                onValueChange={(value) => handleSelectChange('preferredContact', value)}
                className="flex flex-col gap-2 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="contact-email" />
                  <Label htmlFor="contact-email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="contact-phone" />
                  <Label htmlFor="contact-phone">Phone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="contact-both" />
                  <Label htmlFor="contact-both">Both</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code*</Label>
              <Input
                id="zipCode"
                name="zipCode"
                placeholder="Enter your ZIP code"
                value={formData.zipCode}
                onChange={handleInputChange}
                maxLength={10}
              />
            </div>
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
            
            <form onSubmit={handleSubmit}>
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
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-sm h-9 sm:h-10 w-full sm:w-auto"
                    disabled={isSubmitting}
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
