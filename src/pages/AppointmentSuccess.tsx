
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

declare global {
  interface Window {
    Calendly?: any;
  }
}

const AppointmentSuccess = () => {
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
    
    // Initialize Calendly when it's loaded
    script.onload = () => {
      if (window.Calendly) {
        window.Calendly.initInlineWidget({
          url: 'https://calendly.com/quotelinker-support/15min?hide_event_type_details=1&hide_gdpr_banner=1',
          parentElement: document.getElementById('calendly-inline-widget'),
          minWidth: '320px',
          height: '700px',
        });
      }
    };
    
    return () => {
      // Clean up script on component unmount
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-4">
      <div className="flex items-center justify-center gap-2 my-6">
        <img 
          src="/quotelinker-logo.png" 
          alt="QuoteLinker Logo" 
          className="h-12 w-auto" 
        />
        <span className="font-bold text-xl">QuoteLinker</span>
      </div>
      
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-2 rounded-full">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Quote Request Received!</h1>
        </div>
        
        <p className="text-gray-600 mb-4">
          Thank you for submitting your life insurance quote request. One of our licensed insurance agents will review your information and contact you shortly.
        </p>
        
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Want to speak with an agent right away?
          </h2>
          <p className="text-gray-600 mb-4">
            Schedule a convenient time below for a 15-minute call with one of our insurance experts.
          </p>
        </div>
        
        <div className="flex justify-center mb-6">
          <Link to="/">
            <Button variant="outline">Return to Home</Button>
          </Link>
        </div>
      </div>
      
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img 
            src="/quotelinker-logo.png" 
            alt="QuoteLinker Logo" 
            className="h-8 w-auto" 
          />
          <h2 className="text-xl font-bold">Schedule Your Call</h2>
        </div>
        
        <div id="calendly-inline-widget" className="min-w-[320px] h-[700px]"></div>
      </div>
    </div>
  );
};

export default AppointmentSuccess;
