"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Shield,
  Globe,
  Users,
  Sprout,
  Clock,
  Camera,
  CloudRain,
} from "lucide-react";

export function Features() {
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

  const features = [
    {
      icon: MessageCircle,
      title: "Hindi Support",
      description:
        "Ask questions in Hindi and get responses in your native language. No language barriers in farming advice.",
      color: "green",
    },
    {
      icon: Shield,
      title: "Crop Disease Detection",
      description:
        "Upload photos of your crops and get instant disease identification with treatment recommendations.",
      color: "green",
    },
    {
      icon: Globe,
      title: "Local Weather Insights",
      description:
        "Get weather-based farming advice tailored to India's climates and seasonal patterns.",
      color: "green",
    },
    {
      icon: Users,
      title: "Expert Escalation",
      description:
        "Complex issues are automatically escalated to local agricultural officers for human expertise.",
      color: "green",
    },
    {
      icon: Sprout,
      title: "Crop-Specific Advice",
      description:
        "Tailored recommendations for rice, wheat, pulses, spices, and other crops across India.",
      color: "green",
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description:
        "Get farming advice anytime, anywhere. Your digital Krishi Officer never sleeps.",
      color: "green",
    },
    {
      icon: Camera,
      title: "Visual Diagnostics",
      description:
        "AI-powered image analysis to identify plant diseases, pests, and nutrient deficiencies instantly.",
      color: "green",
    },
    {
      icon: CloudRain,
      title: "Monsoon Planning",
      description:
        "Specialized guidance for pre-monsoon, monsoon, and post-monsoon farming activities across India.",
      color: "green",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20 group-hover:border-blue-500/40",
      green: "from-green-500/10 to-green-600/5 border-green-500/20 group-hover:border-green-500/40",
      purple: "from-purple-500/10 to-purple-600/5 border-purple-500/20 group-hover:border-purple-500/40",
      orange: "from-orange-500/10 to-orange-600/5 border-orange-500/20 group-hover:border-orange-500/40",
      emerald: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 group-hover:border-emerald-500/40",
      indigo: "from-indigo-500/10 to-indigo-600/5 border-indigo-500/20 group-hover:border-indigo-500/40",
      pink: "from-pink-500/10 to-pink-600/5 border-pink-500/20 group-hover:border-pink-500/40",
      cyan: "from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 group-hover:border-cyan-500/40",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      blue: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
      green: "text-green-600 dark:text-green-400 bg-green-500/10",
      purple: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
      orange: "text-orange-600 dark:text-orange-400 bg-orange-500/10",
      emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
      pink: "text-pink-600 dark:text-pink-400 bg-pink-500/10",
      cyan: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-24 bg-gradient-to-b from-muted/20 to-background"
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
            Everything You Need for{" "}
            <span className="text-primary">Smart Farming</span>
          </h2>
          <p
            className={`text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Comprehensive agricultural support designed specifically for Kerala farmers, 
            combining traditional wisdom with modern AI technology.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group p-6 rounded-2xl bg-gradient-to-br ${getColorClasses(
                  feature.color
                )} border backdrop-blur-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: `${400 + index * 100}ms`,
                }}
              >
                <div
                  className={`mb-4 p-3 rounded-xl w-fit transition-all duration-300 ${getIconColorClasses(
                    feature.color
                  )}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-3 group-hover:text-foreground transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div
          className={`mt-20 text-center transition-all duration-1000 delay-1200 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl p-8 sm:p-12 border border-primary/20 backdrop-blur-sm">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Ready to Experience the Future of Farming?
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of Indian farmers who are already using our AI-powered 
              platform to make smarter farming decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl">
                Start Free Trial
              </button>
              <button className="border border-primary/30 text-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/10 transition-colors backdrop-blur-sm">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
