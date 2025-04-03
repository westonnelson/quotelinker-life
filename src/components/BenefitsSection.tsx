
import React from 'react';
import { Clock, DollarSign, ShieldCheck, Heart } from 'lucide-react';

const benefits = [
  {
    id: 1,
    icon: Clock,
    title: "Quick & Easy Process",
    description: "Get your life insurance quote in minutes, not days. Our streamlined process makes protection simple."
  },
  {
    id: 2,
    icon: DollarSign,
    title: "Affordable Coverage",
    description: "Plans starting as low as $15/month. Find the right balance of coverage and cost for your family."
  },
  {
    id: 3,
    icon: ShieldCheck,
    title: "Coverage You Can Trust",
    description: "We work with A-rated insurers to ensure your family is protected by financially strong companies."
  },
  {
    id: 4,
    icon: Heart,
    title: "Peace of Mind",
    description: "Rest easy knowing your loved ones will be financially protected, no matter what happens."
  }
];

export const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-16">
      <div className="container-custom">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="heading-2 mb-4">Why Choose Our Life Insurance</h2>
          <p className="paragraph text-gray-600">
            We make it easy to find affordable life insurance coverage that protects what matters most.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="card-shadow p-6 flex flex-col items-center text-center">
              <div className="bg-primary/10 text-primary p-3 rounded-full mb-4">
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="heading-3 mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a href="#lead-form" className="btn-primary inline-flex">
            Get Your Free Quote
          </a>
        </div>
        
        <div className="mt-16 bg-gray-100 p-8 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="heading-3 mb-4">Still Have Questions?</h3>
              <p className="paragraph mb-6">
                Our insurance experts are here to help you understand your options and find the perfect policy for your needs.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary p-1 rounded-full mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-sm">Understand different policy types and options</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary p-1 rounded-full mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-sm">Get personalized recommendations based on your situation</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary p-1 rounded-full mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-sm">Learn how to maximize coverage while minimizing premiums</p>
                </div>
              </div>
            </div>
            <div id="appointment-booking" className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold text-lg mb-4">Schedule a Free Consultation</h4>
              <p className="text-sm text-gray-600 mb-4">
                Book a 15-minute call with a licensed insurance expert who can answer all your questions.
              </p>
              <a 
                href="#lead-form" 
                className="btn-primary w-full flex justify-center items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Book Appointment
              </a>
              <p className="text-xs text-gray-500 mt-4 text-center">
                No obligation. Cancel or reschedule anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
