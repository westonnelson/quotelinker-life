
import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Jennifer M.",
    role: "Protected Since 2022",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    quote: "The process was incredibly simple and fast. I was able to get coverage for my family in less than 15 minutes. The peace of mind is worth every penny.",
    rating: 5,
  },
  {
    id: 2,
    name: "Robert T.",
    role: "Protected Since 2023",
    image: "https://randomuser.me/api/portraits/men/47.jpg",
    quote: "I was hesitant at first, but the guidance I received was phenomenal. Found a policy that fits my budget perfectly and protects my kids' future.",
    rating: 5,
  },
  {
    id: 3,
    name: "Sarah K.",
    role: "Protected Since 2021",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    quote: "After comparing quotes from multiple providers, this service found me the best rate and coverage. The agent explained everything clearly - no insurance jargon!",
    rating: 5,
  },
];

export const TestimonialSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="heading-2 mb-4">Real People, Real Protection</h2>
          <p className="paragraph text-gray-600">
            Don't just take our word for it. See what our customers have to say about their experience securing their family's future.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <blockquote className="text-gray-700 mb-6">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex flex-wrap justify-center gap-4 items-center px-6 py-3 bg-white rounded-full shadow-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
            <span className="text-sm font-medium">4.9 out of 5 based on 300+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
