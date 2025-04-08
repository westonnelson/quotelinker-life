
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Lock } from 'lucide-react';
import { UseFormReturn } from "react-hook-form";
import { LeadFormData } from "@/utils/formSchemas";

interface ContactPreferencesStepProps {
  form: UseFormReturn<LeadFormData>;
}

const ContactPreferencesStep: React.FC<ContactPreferencesStepProps> = ({ form }) => {
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
};

export default ContactPreferencesStep;
