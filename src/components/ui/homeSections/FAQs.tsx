"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export function FAQs() {
  const [isVisible, setIsVisible] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
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

  const faqs = [
    {
      question: "How does the AI understand Malayalam queries?",
      answer: "Our AI is specifically trained on Malayalam agricultural terminology and local farming contexts. It uses advanced natural language processing to understand your questions in Malayalam and provide accurate, contextually relevant answers about Kerala's farming practices.",
    },
    {
      question: "What types of crops can the system help with?",
      answer: "The Digital Krishi Officer supports all major Kerala crops including rice (നെല്ല്), coconut (തെങ്ങ്), rubber (റബ്ബർ), spices like cardamom and pepper, coffee, tea, fruits like mango and jackfruit, and various vegetables. The system is continuously updated with new crop information.",
    },
    {
      question: "How accurate is the crop disease identification?",
      answer: "Our AI has been trained on thousands of images of crop diseases common in Kerala and achieves over 90% accuracy in disease identification. However, for complex cases, the system automatically escalates to local agricultural experts for verification.",
    },
    {
      question: "Is the service available 24/7?",
      answer: "Yes, the Digital Krishi Officer is available 24 hours a day, 7 days a week. You can get instant responses to your queries anytime, whether it's early morning before heading to the fields or late at night when you notice something concerning about your crops.",
    },
    {
      question: "How does weather integration work?",
      answer: "The system integrates real-time weather data specific to Kerala's districts and provides personalized advice based on current and forecasted weather conditions. This includes monsoon predictions, temperature variations, and humidity levels that affect your specific crops.",
    },
    {
      question: "Can I get advice for organic farming methods?",
      answer: "Absolutely! The system includes comprehensive knowledge about organic farming practices, natural pest control methods, organic fertilizers, and sustainable farming techniques that are suitable for Kerala's climate and soil conditions.",
    },
    {
      question: "What if the AI can't answer my specific question?",
      answer: "If the AI encounters a complex query it cannot handle confidently, it automatically escalates your question to local agricultural officers and experts who can provide personalized human guidance. You'll receive a response within 24 hours.",
    },
    {
      question: "Is my farming data kept private and secure?",
      answer: "Yes, we take data privacy very seriously. All your farming data, photos, and conversations are encrypted and stored securely. We never share your personal information with third parties, and you have full control over your data.",
    },
    {
      question: "How much does the service cost?",
      answer: "We offer a free tier that includes basic crop advice and disease identification. Premium features like detailed weather analytics, personalized farming calendars, and priority expert consultation are available through affordable subscription plans starting from ₹99/month.",
    },
    {
      question: "Do I need internet connection to use the service?",
      answer: "While an internet connection is required for real-time AI responses and weather updates, we're developing an offline mode that will allow basic crop identification and cached advice for areas with limited connectivity.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-muted/30 to-background"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Frequently Asked Questions</span>
          </div>
          
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Got Questions? We've Got{" "}
            <span className="text-primary">Answers</span>
          </h2>
          <p
            className={`text-lg sm:text-xl text-muted-foreground transition-all duration-1000 delay-400 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Everything you need to know about using our AI-powered agricultural platform.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border border-border/50 rounded-2xl bg-card/30 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: `${600 + index * 100}ms`,
              }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-accent/20 rounded-2xl transition-colors"
              >
                <span className="font-semibold text-card-foreground pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                    openFAQ === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openFAQ === index ? "max-h-96 pb-6" : "max-h-0"
                }`}
              >
                <div className="px-6 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`mt-16 text-center transition-all duration-1000 delay-1200 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl p-8 sm:p-12 border border-primary/20 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Still Have Questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              Our team of agricultural experts is here to help you succeed. 
              Get personalized support for your farming needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl">
                Contact Support
              </button>
              <button className="border border-primary/30 text-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/10 transition-colors backdrop-blur-sm">
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
