"use client";

import { useEffect, useRef, useState } from "react";
import { Brain, Leaf, MessageCircle, Shield } from "lucide-react";

export function Description() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI Intelligence",
      description: "Advanced machine learning models trained for India's diverse agricultural conditions and practices.",
    },
    {
      icon: MessageCircle,
      title: "Hindi Support",
      description: "Communicate naturally in Hindi for better understanding and accurate advice.",
    },
    {
      icon: Leaf,
      title: "Crop Expertise",
      description: "Specialized knowledge for rice, wheat, pulses, spices, and other crops across India.",
    },
    {
      icon: Shield,
      title: "Reliable Guidance",
      description: "Backed by agricultural science and validated by Indian farming experts and practices.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Revolutionizing Agriculture with{" "}
            <span className="text-primary">AI Technology</span>
          </h2>
          <p
            className={`text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Our Digital Krishi Officer combines cutting-edge artificial intelligence 
            with deep understanding of India's diverse agricultural landscape to provide 
            personalized, actionable farming advice.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:-translate-y-2 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: `${400 + index * 150}ms`,
                }}
              >
                <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div
          className={`mt-20 text-center transition-all duration-1000 delay-1000 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl p-8 sm:p-12 border border-border/30">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Built for Indian Farmers, by Agricultural Experts
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Every recommendation is tailored to India's unique monsoons, 
              soils and regional practices across states.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="px-3 py-1 bg-primary/10 rounded-full">Monsoon-Aware</span>
              <span className="px-3 py-1 bg-primary/10 rounded-full">Soil-Specific</span>
              <span className="px-3 py-1 bg-primary/10 rounded-full">Locally-Validated</span>
              <span className="px-3 py-1 bg-primary/10 rounded-full">Culturally-Sensitive</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
