
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { LeadFormData } from "@/utils/formSchemas";

interface BasicInfoStepProps {
  form: UseFormReturn<LeadFormData>;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ form }) => {
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
};

export default BasicInfoStep;
