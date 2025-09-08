"use client";

import Link from "next/link";
import { ArrowRight, Sprout, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />
      
      
      <div className="max-w-7xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 transition-all duration-1000 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Agricultural Intelligence</span>
        </div>

        {/* Main Heading */}
        <h1
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 transition-all duration-1000 delay-200 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          Your AI-Powered
          <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Agricultural Advisor
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-400 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          Get expert farming advice in{" "}
          <span className="text-primary font-semibold">Hindi</span>, 24/7.
          From crop diseases to weather decisions, our AI understands Indian
          farming like a local Krishi Officer.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 transition-all duration-1000 delay-600 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <Link
            href="/register"
            className="group bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:from-primary/90 hover:to-primary/80 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Start Farming Smarter
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="group border-2 border-primary/30 text-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 backdrop-blur-sm"
          >
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto transition-all duration-1000 delay-800 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-muted-foreground text-sm">Available Support</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">100+</div>
            <div className="text-muted-foreground text-sm">Crop Types</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">Hindi</div>
            <div className="text-muted-foreground text-sm">Native Language</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      
    </section>
  );
}
