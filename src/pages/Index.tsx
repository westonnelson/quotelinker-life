
import React from 'react';
import HeroSection from '@/components/HeroSection';
import LeadForm from '@/components/LeadForm';
import TestimonialSection from '@/components/TestimonialSection';
import BenefitsSection from '@/components/BenefitsSection';
import { Shield, Mail } from 'lucide-react';

const Index = () => {
  return <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="container-custom flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">QuoteLinker</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#benefits" className="text-sm font-medium hover:text-primary">Benefits</a>
            <a href="#lead-form" className="text-sm font-medium hover:text-primary">Get a Quote</a>
            <div className="flex items-center gap-1">
              
              
            </div>
          </div>
          
          <a href="#lead-form" className="btn-primary">
            Get My Free Quote
          </a>
        </div>
      </header>
      
      {/* Main Content */}
      <main>
        <HeroSection />
        <LeadForm />
        <BenefitsSection />
        <TestimonialSection />
        
        {/* CTA Section */}
        <section className="py-16 bg-primary">
          <div className="container-custom text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Protect Your Family's Future?</h2>
            <p className="text-lg mb-8 text-white/85 max-w-2xl mx-auto">
              Get the coverage you need at a price you can afford. It only takes a few minutes to secure your loved ones' financial future.
            </p>
            <a href="#lead-form" className="bg-white text-primary hover:bg-gray-100 font-medium py-3 px-8 rounded-md transition-colors duration-300">
              Get My Free Quote Now
            </a>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-white" />
                <span className="font-bold text-lg">QuoteLinker</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Helping families secure their financial future with reliable, affordable life insurance coverage.
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 justify-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm">Email us at</p>
                    <a href="mailto:support@quotelinker.com" className="font-medium hover:text-primary">support@quotelinker.com</a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Life Insurance FAQ</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} QuoteLinker LLC. All rights reserved.</p>
            <p className="mt-1">Licensed insurance agents. QuoteLinker is not an insurer or an insurance agency. QuoteLinker connects consumers interested in life insurance coverage with licensed professionals. Coverage subject to policy terms and conditions governed by submitted life policy applications.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;
