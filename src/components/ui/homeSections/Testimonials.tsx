"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

export function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const testimonials = [
    {
      name: "रमेश शर्मा",
      location: "पंजाब",
      crop: "गेहूं और धान",
      rating: 5,
      testimonial:
        "यह AI सिस्टम मेरी खेती में क्रांति लेकर आया है। हिंदी में सवाल पूछ सकता हूं और तुरंत सटीक जवाब मिलता है। मेरी फसल की पैदावार 40% बढ़ गई है।",
      translation:
        "This AI system has brought a revolution to my farming. I can ask questions in Hindi and get accurate answers immediately. My crop yield has increased by 40%.",
    },
    {
      name: "സുനിത ദേവി",
      location: "ആലപ്പുഴ",
      crop: "നെല്ല് കൃഷി",
      rating: 5,
      testimonial:
        "മലയാളത്തിൽ ചോദിക്കാൻ കഴിയുന്നതും ഉടനെ ഉത്തരം കിട്ടുന്നതും വളരെ നല്ലതാണ്. എന്റെ നെല്ല് വിളയുടെ ഉത്പാദനം 30% വർധിച്ചു।",
      translation:
        "Being able to ask in Malayalam and get immediate answers is excellent. My rice crop production increased by 30%.",
    },
    {
      name: "Priya Mehta",
      location: "Gujarat",
      crop: "Cotton & Groundnut",
      rating: 5,
      testimonial:
        "The crop disease detection feature is amazing! I just take a photo and instantly know what's wrong with my plants. It has saved me thousands of rupees in losses.",
      translation:
        "The crop disease detection feature is amazing! I just take a photo and instantly know what's wrong with my plants. It has saved me thousands of rupees in losses.",
    },
    {
      name: "अनिल वर्मा",
      location: "उत्तर प्रदेश",
      crop: "आलू और टमाटर",
      rating: 5,
      testimonial:
        "मौसम की जानकारी बहुत सटीक मिलती है। कीट नियंत्रण की सलाह से मेरी फसल को बहुत फायदा हुआ है। अब नुकसान बहुत कम होता है।",
      translation:
        "Weather information is very accurate. Pest control advice has greatly benefited my crops. Now losses are much reduced.",
    },
    {
      name: "Sarah Johnson",
      location: "Karnataka",
      crop: "Coffee & Spices",
      rating: 5,
      testimonial:
        "As a modern farmer, I love how this AI platform combines traditional knowledge with cutting-edge technology. The 24/7 support has been invaluable during critical farming periods.",
      translation:
        "As a modern farmer, I love how this AI platform combines traditional knowledge with cutting-edge technology. The 24/7 support has been invaluable during critical farming periods.",
    },
    {
      name: "മുരളി മേനോൻ",
      location: "വയനാട്",
      crop: "കാപ്പി & മസാല",
      rating: 5,
      testimonial:
        "കാലാവസ്ഥാ വിവരങ്ങളും കീടനിയന്ത്രണവും വളരെ കൃത്യമാണ്. ഇപ്പോൾ എന്റെ കാപ്പി തോട്ടത്തിൽ നഷ്ടം വളരെ കുറഞ്ഞു।",
      translation:
        "Weather information and pest control are very accurate. Now losses in my coffee plantation have reduced significantly.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            What Farmers Across India Are Saying
          </h2>
          <p
            className={`text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Real stories from farmers across different states of India, speaking in their 
            native languages about how our AI platform has transformed their farming practices.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.name}-${testimonial.location}-${index}`}
              className={`group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: `${400 + index * 150}ms`,
              }}
            >
              {/* Quote Icon */}
              <div className="mb-4 p-2 bg-primary/10 rounded-lg w-fit">
                <Quote className="h-5 w-5 text-primary" />
              </div>

              {/* Malayalam Testimonial */}
              <blockquote className="text-card-foreground mb-4 leading-relaxed text-sm">
                "{testimonial.testimonial}"
              </blockquote>

              {/* English Translation */}
              <p className="text-muted-foreground text-xs mb-4 italic border-l-2 border-primary/20 pl-3">
                {testimonial.translation}
              </p>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-yellow-500 fill-current"
                  />
                ))}
              </div>

              {/* Author Info */}
              <div className="border-t border-border/30 pt-4">
                <div className="font-semibold text-card-foreground">
                  {testimonial.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.location} • {testimonial.crop}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div
          className={`mt-20 transition-all duration-1000 delay-1000 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl p-8 sm:p-12 border border-primary/20 backdrop-blur-sm">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">5000+</div>
                <div className="text-muted-foreground">Active Farmers</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <div className="text-muted-foreground">Satisfaction Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Support Available</div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Join the Agricultural Revolution
              </h3>
              <p className="text-muted-foreground">
                Be part of India's farming transformation with AI-powered insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
