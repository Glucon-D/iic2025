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
      name: "രാജേഷ് കുമാർ",
      location: "കോട്ടയം",
      crop: "റബ്ബർ കൃഷി",
      rating: 5,
      testimonial:
        "ഈ AI സിസ്റ്റം എന്റെ റബ്ബർ കൃഷിയിൽ വലിയ മാറ്റം കൊണ്ടുവന്നു. രോഗങ്ങൾ തിരിച്ചറിയാനും ചികിത്സ നൽകാനും വളരെ സഹായകരമാണ്.",
      translation:
        "This AI system has brought great change to my rubber cultivation. It's very helpful in identifying diseases and providing treatment.",
    },
    {
      name: "സുനിത ദേവി",
      location: "ആലപ്പുഴ",
      crop: "നെല്ല് കൃഷി",
      rating: 5,
      testimonial:
        "മലയാളത്തിൽ ചോദിക്കാൻ കഴിയുന്നതും ഉടനെ ഉത്തരം കിട്ടുന്നതും വളരെ നല്ലതാണ്. എന്റെ നെല്ല് വിളയുടെ ഉത്പാദനം 30% വർധിച്ചു.",
      translation:
        "Being able to ask in Malayalam and get immediate answers is excellent. My rice crop production increased by 30%.",
    },
    {
      name: "മുരളി മേനോൻ",
      location: "വയനാട്",
      crop: "കാപ്പി & മസാല",
      rating: 5,
      testimonial:
        "കാലാവസ്ഥാ വിവരങ്ങളും കീടനിയന്ത്രണവും വളരെ കൃത്യമാണ്. ഇപ്പോൾ എന്റെ കാപ്പി തോട്ടത്തിൽ നഷ്ടം വളരെ കുറഞ്ഞു.",
      translation:
        "Weather information and pest control are very accurate. Now losses in my coffee plantation have reduced significantly.",
    },
    {
      name: "പ്രിയ രാജൻ",
      location: "ഇടുക്കി",
      crop: "ഇലയ്ക്ക & കർദ്ദമം",
      rating: 5,
      testimonial:
        "24 മണിക്കൂറും സഹായം ലഭിക്കുന്നത് വളരെ നല്ലതാണ്. പ്രത്യേകിച്ച് മഴക്കാലത്ത് പെട്ടെന്ന് ഉത്തരം കിട്ടുന്നത് ഒരു വലിയ സഹായമാണ്.",
      translation:
        "Getting help 24 hours is excellent. Especially during monsoon, getting quick answers is a great help.",
    },
    {
      name: "അനിൽ വർമ്മ",
      location: "തൃശ്ശൂർ",
      crop: "തെങ്ങ് & പച്ചക്കറി",
      rating: 5,
      testimonial:
        "ഫോട്ടോ എടുത്ത് അയച്ചാൽ ഉടനെ രോഗം കണ്ടുപിടിക്കുന്നു. പഴയ കാലത്ത് ഡോക്ടറെ കാണാൻ ദൂരം പോകേണ്ടിയിരുന്നു.",
      translation:
        "When I send a photo, it immediately identifies the disease. In the old days, I had to travel far to see a doctor.",
    },
    {
      name: "ലീല ദാസ്",
      location: "കോഴിക്കോട്",
      crop: "പഴവർഗ്ഗങ്ങൾ",
      rating: 5,
      testimonial:
        "എന്റെ മാങ്ങ, ജാക്ക്ഫ്രൂട്ട് മരങ്ങളുടെ പരിചരണത്തിൽ ഇത് വളരെ സഹായകമാണ്. ഉത്പാദനം വളരെയധികം മെച്ചപ്പെട്ടു.",
      translation:
        "This is very helpful in caring for my mango and jackfruit trees. Production has improved significantly.",
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
            What Kerala Farmers Are Saying
          </h2>
          <p
            className={`text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Real stories from farmers across Kerala who have transformed their 
            agricultural practices with our AI-powered platform.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
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
                Be part of Kerala's farming transformation with AI-powered insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
