
import React from 'react';

export const HeroSection = () => {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-primary px-4 py-1.5 rounded-full">
              <img 
                src="/lovable-uploads/4a43f3ca-40c9-43b0-b9a5-a2106c990f37.png" 
                alt="QuoteLinker Logo" 
                className="h-4 w-auto" 
              />
              <span className="text-sm font-medium">Trusted Protection For Your Family</span>
            </div>
            
            <h1 className="heading-1">
              Get The Life Insurance <span style={{ color: '#00e1ff' }}>Coverage Your Family Deserves</span>
            </h1>
            
            <p className="paragraph text-gray-600 max-w-lg">
              Protect your loved ones' financial future today. Get matched with the perfect policy in minutes and secure your family's tomorrow with QuoteLinker.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <a href="#lead-form" className="btn-primary">
                Get My Free Quote
              </a>
              <a href="/appointment-success" className="text-primary hover:text-primary-hover font-medium py-2 px-4 transition-colors duration-200">
                Schedule a Call
              </a>
            </div>
            
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((item) => (
                  <div 
                    key={item} 
                    className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"
                  ></div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">4,000+</span> families protected this month
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative z-10 rounded-xl overflow-hidden shadow-xl animate-slide-in">
              <img 
                src="/lovable-uploads/5d933709-1084-4ee3-ac2e-9e3866cf7eeb.png" 
                alt="Happy family with two young children" 
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute top-5 -right-4 md:top-10 md:-right-8 bg-white p-4 rounded-lg shadow-lg z-20">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">Coverage in Minutes</p>
                  <p className="text-xs text-gray-500">Fast & Easy Process</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 md:-bottom-8 md:-left-8 bg-white p-4 rounded-lg shadow-lg z-20">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">Thousands Protected</p>
                  <p className="text-xs text-gray-500">Join Them Today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
