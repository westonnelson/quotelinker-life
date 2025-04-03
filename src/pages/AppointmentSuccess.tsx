
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const AppointmentSuccess = () => {
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center mb-8">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-success" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
        <p className="text-gray-600 mb-6">
          Your information has been successfully submitted. Our team will contact you shortly with your personalized life insurance quote.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="font-semibold mb-2">What happens next?</h2>
          <ol className="text-left space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary rounded-full p-1 mt-0.5 flex-shrink-0">
                <span className="block h-4 w-4 text-xs font-bold flex items-center justify-center">1</span>
              </div>
              <p>A licensed insurance agent will review your information</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary rounded-full p-1 mt-0.5 flex-shrink-0">
                <span className="block h-4 w-4 text-xs font-bold flex items-center justify-center">2</span>
              </div>
              <p>You'll receive a personalized quote via your preferred contact method</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary rounded-full p-1 mt-0.5 flex-shrink-0">
                <span className="block h-4 w-4 text-xs font-bold flex items-center justify-center">3</span>
              </div>
              <p>Our team will answer any questions and help you finalize your coverage</p>
            </li>
          </ol>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Homepage
          </Link>
        </div>
      </div>
      
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-center">Schedule a Call with an Agent</h2>
        <p className="text-gray-600 text-center mb-6">
          Want to discuss your options right away? Schedule a call with one of our licensed insurance experts.
        </p>
        <div 
          className="calendly-inline-widget" 
          data-url="https://calendly.com/quotelinker-support/15min?hide_event_type_details=1&hide_gdpr_banner=1" 
          style={{ minWidth: "320px", height: "700px" }}
        ></div>
      </div>
    </div>
  );
};

export default AppointmentSuccess;
