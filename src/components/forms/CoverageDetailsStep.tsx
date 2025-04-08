
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { LeadFormData, coverageOptions } from "@/utils/formSchemas";

interface CoverageDetailsStepProps {
  form: UseFormReturn<LeadFormData>;
}

const CoverageDetailsStep: React.FC<CoverageDetailsStepProps> = ({ form }) => {
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
};

export default CoverageDetailsStep;
