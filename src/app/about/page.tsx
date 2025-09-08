"use client";

import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Sprout, Shield, Users, Globe, MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function AboutPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [missionVisible, setMissionVisible] = useState(false);
  const [howVisible, setHowVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const missionRef = useRef<HTMLElement>(null);
  const howRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const makeObserver = (cb: (v: boolean) => void, threshold = 0.1) => {
      return new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) cb(true);
      }, { threshold });
    };

    const heroObs = makeObserver(setHeroVisible);
    const missionObs = makeObserver(setMissionVisible, 0.2);
    const howObs = makeObserver(setHowVisible, 0.1);
    const ctaObs = makeObserver(setCtaVisible, 0.1);

    if (heroRef.current) heroObs.observe(heroRef.current);
    if (missionRef.current) missionObs.observe(missionRef.current);
    if (howRef.current) howObs.observe(howRef.current);
    if (ctaRef.current) ctaObs.observe(ctaRef.current);

    return () => {
      heroObs.disconnect();
      missionObs.disconnect();
      howObs.disconnect();
      ctaObs.disconnect();
    };
  }, []);

  return (
    <div className="flex-1">
      <Navbar />

      {/* Hero / Intro */}
      <section
        id="about"
        ref={heroRef}
        className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 transition-all duration-1000 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Our Story</span>
          </div>

          <h2
            className={`text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 transition-all duration-1000 delay-200 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            About
            <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Digital Krishi Officer
            </span>
          </h2>
          <p
            className={`text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-400 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            An AI-powered agricultural advisory platform designed for Indian farmers.
            We provide timely, localized guidance in Hindi to help you make confident,
            data-driven decisions on your farm.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section ref={missionRef} className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center">
          <div
            className={`group p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-150 ease-out transform-gpu hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] ${
              missionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <Sprout className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-semibold text-card-foreground">Our Mission</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We aim to democratize expert farming knowledge by combining
              cutting-edge AI with India-focused agricultural insights. From
              disease detection to weather-aware planning, we strive to bring
              a helpful Krishi Officer to every farmer’s pocket.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div
              className={`group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-150 ease-out transform-gpu hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] ${
                missionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              <Shield className="h-8 w-8 text-primary mb-3" />
              <h4 className="text-lg font-semibold mb-2 text-card-foreground">Reliable Guidance</h4>
              <p className="text-muted-foreground text-sm">
                Recommendations grounded in agronomic best practices, tuned for
                India’s diverse crops and climates.
              </p>
            </div>
            <div
              className={`group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-150 ease-out transform-gpu hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] ${
                missionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <Users className="h-8 w-8 text-primary mb-3" />
              <h4 className="text-lg font-semibold mb-2 text-card-foreground">Farmer-First</h4>
              <p className="text-muted-foreground text-sm">
                Built with accessibility in mind: clear Hindi responses and
                simple flows.
              </p>
            </div>
            <div
              className={`group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-150 ease-out transform-gpu hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] ${
                missionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              <Globe className="h-8 w-8 text-primary mb-3" />
              <h4 className="text-lg font-semibold mb-2 text-card-foreground">Local Context</h4>
              <p className="text-muted-foreground text-sm">
                Location-aware suggestions that respect India’s seasonal
                patterns and microclimates.
              </p>
            </div>
            <div
              className={`group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-150 ease-out transform-gpu hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] ${
                missionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "600ms" }}
            >
              <MessageCircle className="h-8 w-8 text-primary mb-3" />
              <h4 className="text-lg font-semibold mb-2 text-card-foreground">In Your Language</h4>
              <p className="text-muted-foreground text-sm">
                Ask questions in Hindi and get natural, easy-to-follow
                answers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section ref={howRef} className="py-24 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 transition-all duration-1000 ${
                howVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              How It Works
            </h3>
            <p
              className={`text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
                howVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Simple steps to get accurate, timely farming assistance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div
              className={`group p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-150 ease-out transform-gpu hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] ${
                howVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold mb-4">1</span>
              <h4 className="text-xl font-semibold text-card-foreground mb-2">Ask in Hindi</h4>
              <p className="text-muted-foreground">
                Describe your crop, symptoms, or question. You can also share
                images where relevant.
              </p>
            </div>
            <div
              className={`group p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-150 ease-out transform-gpu hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] ${
                howVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold mb-4">2</span>
              <h4 className="text-xl font-semibold text-card-foreground mb-2">Get Smart Advice</h4>
              <p className="text-muted-foreground">
                Our AI analyzes the context with India-focused knowledge to
                provide clear next steps.
              </p>
            </div>
            <div
              className={`group p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-150 ease-out transform-gpu hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] ${
                howVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold mb-4">3</span>
              <h4 className="text-xl font-semibold text-card-foreground mb-2">Act With Confidence</h4>
              <p className="text-muted-foreground">
                Follow the recommendations. For complex issues, escalate to a
                human officer when needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section ref={ctaRef} className="py-24 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3
            className={`text-3xl sm:text-4xl font-bold text-foreground mb-4 transition-all duration-1000 ${
              ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Start Getting Better Yields
          </h3>
          <p
            className={`text-muted-foreground text-lg mb-8 transition-all duration-1000 delay-200 ${
              ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Join farmers across India who use AI guidance to save time and
            reduce guesswork.
          </p>
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-400 ${
              ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <Link href="/register" className="group bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Create Your Account
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="group border-2 border-primary/30 text-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 backdrop-blur-sm">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
