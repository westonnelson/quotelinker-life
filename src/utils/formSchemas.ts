
import * as z from "zod";

export const leadFormSchema = z.object({
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

export type LeadFormData = z.infer<typeof leadFormSchema>;

export const initialFormData: LeadFormData = {
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

export const coverageOptions = [
  '$50,000',
  '$100,000',
  '$250,000',
  '$500,000',
  '$1,000,000',
];

export const formSteps = [
  { title: 'Basic Info', description: 'Tell us about yourself' },
  { title: 'Coverage Details', description: 'Customize your coverage' },
  { title: 'Contact Preferences', description: 'How should we reach you?' },
];
