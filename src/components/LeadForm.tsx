
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
      // Validate first step
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return false;
      }
      // Simple email validation
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive"
        });
        return false;
      }
      // Simple phone validation
      if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid 10-digit phone number.",
          variant: "destructive"
        });
        return false;
      }
    } else if (currentStep === 1) {
      // Validate second step
      if (!formData.age || !formData.gender || !formData.coverageAmount) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return false;
      }
      // Age validation
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
      // Validate third step
      if (!formData.zipCode) {
        toast({
          title: "Missing Information",
          description: "Please enter your ZIP code.",
          variant: "destructive"
        });
        return false;
      }
      // Zip code validation
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
    
    // Final submission
    setIsSubmitting(true);
    
    try {
      // Save to Supabase - Using the Life table instead of leads due to TypeScript definition
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
        throw new Error(`Database error: ${leadError.message}`);
      }

      // Process in parallel to speed things up
      const leadId = leadData.id;
      
      // Submit to HubSpot
      const hubspotPromise = fetch('/functions/v1/create-hubspot-contact', {
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
      }).then(res => {
        if (!res.ok) throw new Error('HubSpot integration failed');
        return res.json();
      });

      // Send confirmation email
      const emailPromise = fetch('/functions/v1/send-confirmation-email', {
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
      }).then(res => {
        if (!res.ok) throw new Error('Email sending failed');
        return res.json();
      });

      // Wait for both to complete
      await Promise.allSettled([hubspotPromise, emailPromise]);
      
      // Show success message
      toast({
        title: "Form Submitted Successfully",
        description: "We'll contact you shortly with your quote!",
      });
      
      // Redirect to success page
      navigate('/appointment-success');
    } catch (error: any) {
      console.error("Submission error:", error);
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
    <section id="lead-form" className="py-12">
      <div className="container-custom max-w-3xl">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-primary px-6 py-6 text-white">
            <h2 className="text-2xl font-bold">Get Your Free Life Insurance Quote</h2>
            <p className="text-primary-foreground/80">Complete the form below to receive your personalized quote</p>
          </div>
          
          <div className="p-6">
            {/* Progress steps */}
            <div className="flex justify-between mb-8">
              {formSteps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex flex-col items-center ${
                    index === currentStep ? "opacity-100" : "opacity-60"
                  }`}
                >
                  <div 
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      index < currentStep
                        ? "bg-green-100 text-green-600"
                        : index === currentStep
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-gray-500 hidden md:block">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit}>
              {renderStep()}
              
              <div className="flex justify-between mt-8">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                )}
                
                <div className="ml-auto">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover"
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
            
            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-4">
              <div className="flex flex-col items-center justify-center bg-green-100 text-green-600 p-2 rounded-full">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium">Want to speak with an agent?</h3>
                <p className="text-sm text-gray-500">
                  <a 
                    href="/appointment-success" 
                    className="text-primary hover:underline"
                  >
                    Schedule a call
                  </a> with one of our licensed insurance experts.
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
