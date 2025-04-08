
import React from 'react';
import HeroSection from '@/components/HeroSection';
import LeadForm from '@/components/LeadForm';
import TestimonialSection from '@/components/TestimonialSection';
import BenefitsSection from '@/components/BenefitsSection';
import { Mail, Phone, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  return <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm py-3 sm:py-4 sticky top-0 z-50">
        <div className="container-custom flex justify-between items-center px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/4a43f3ca-40c9-43b0-b9a5-a2106c990f37.png" 
              alt="QuoteLinker Logo" 
              className="h-6 sm:h-8 w-auto"
            />
            <span className="font-bold text-base sm:text-lg text-quotelinker">QuoteLinker</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#benefits" className="text-sm font-medium hover:text-primary">Benefits</a>
            <a href="#lead-form" className="text-sm font-medium hover:text-primary">Get a Quote</a>
            <a href="#testimonials" className="text-sm font-medium hover:text-primary">Testimonials</a>
          </div>
          
          <a href="#lead-form" className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4">
            Get My Free Quote
          </a>
        </div>
      </header>
      
      {/* Main Content */}
      <main>
        <HeroSection />

        <div id="lead-form">
          <LeadForm />
        </div>
        
        <div id="benefits">
          <BenefitsSection />
        </div>
        
        <div id="testimonials">
          <TestimonialSection />
        </div>
        
        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-primary">
          <div className="container-custom text-center text-white px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Ready to Protect Your Family's Future?</h2>
            <p className="text-base sm:text-lg mb-6 sm:mb-8 text-white/85 max-w-2xl mx-auto">
              Get the coverage you need at a price you can afford. It only takes a few minutes to secure your loved ones' financial future.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
              <a href="#lead-form" className="bg-white text-primary hover:bg-gray-100 font-medium py-2.5 px-6 sm:py-3 sm:px-8 rounded-md transition-colors duration-300 text-sm sm:text-base">
                Get My Free Quote Now
              </a>
              <a href="/appointment-success" className="bg-transparent border border-white text-white hover:bg-white/10 font-medium py-2.5 px-6 sm:py-3 sm:px-8 rounded-md transition-colors duration-300 text-sm sm:text-base">
                Schedule a Call
              </a>
            </div>
            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-white/70">No obligation. Cancel anytime.</p>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 sm:py-12">
        <div className="container-custom px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/lovable-uploads/4a43f3ca-40c9-43b0-b9a5-a2106c990f37.png" 
                  alt="QuoteLinker Logo" 
                  className="h-6 sm:h-8 w-auto" 
                />
                <span className="font-bold text-base sm:text-lg text-quotelinker">QuoteLinker</span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 text-center md:text-left">
                Helping families secure their financial future with reliable, affordable life insurance coverage.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-semibold text-base sm:text-lg mb-4">Contact Us</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm">Email us at</p>
                    <a href="mailto:support@quotelinker.com" className="font-medium hover:text-quotelinker text-sm sm:text-base">support@quotelinker.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm">Call us at</p>
                    <a href="tel:+18005551234" className="font-medium hover:text-quotelinker text-sm sm:text-base">(800) 555-1234</a>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm">Available</p>
                    <p className="font-medium text-sm sm:text-base">Mon-Fri, 9am-6pm EST</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-semibold text-base sm:text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-center md:text-left">
                <li><a href="#" className="text-gray-400 hover:text-white text-sm">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a></li>
                <li>
                  <a href="/appointment-success" className="text-gray-400 hover:text-white text-sm">
                    Schedule a Call
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-6 sm:my-8 bg-gray-800" />
          
          <div className="text-center text-xs sm:text-sm text-gray-400">
            <p>© {new Date().getFullYear()} QuoteLinker LLC. All rights reserved.</p>
            <p className="mt-1">QuoteLinker only sends your information to Licensed Insurance Agents. QuoteLinker is not an insurer or an insurance agency. QuoteLinker connects consumers interested in life insurance coverage with licensed professionals. Coverage subject to policy terms and conditions governed by submitted life policy applications.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;
