"use client";

import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Mail, Phone, MessageCircle, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ContactPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const makeObserver = (cb: (v: boolean) => void, threshold = 0.1) =>
      new IntersectionObserver(([entry]) => entry.isIntersecting && cb(true), {
        threshold,
      });

    const heroObs = makeObserver(setHeroVisible, 0.1);
    const contentObs = makeObserver(setContentVisible, 0.15);
    if (heroRef.current) heroObs.observe(heroRef.current);
    if (contentRef.current) contentObs.observe(contentRef.current);
    return () => {
      heroObs.disconnect();
      contentObs.disconnect();
    };
  }, []);

  return (
    <div className="flex-1">
      <Navbar />

      {/* Hero */}
      <section
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
            <span>We’re here to help</span>
          </div>
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 transition-all duration-1000 delay-200 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Contact
            <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Digital Krishi Officer
            </span>
          </h1>
          <p
            className={`text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-400 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Indian farmers can reach us for support in Hindi. Whether you have
            questions, feedback, or need assistance—our team is ready to help.
          </p>
        </div>
      </section>

      {/* Content */}
      <section ref={contentRef} className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-5 gap-8">
          {/* Contact Methods */}
          <div
            className={`space-y-6 lg:col-span-2 ${
              contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            } transition-all duration-1000`}
          >
            <div className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-150 ease-out transform-gpu hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01]">
              <div className="mb-3 p-3 bg-primary/10 rounded-xl w-fit">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-1">Email</h3>
              <p className="text-sm text-muted-foreground mb-3">Get support within 24 hours</p>
              <a href="mailto:support@digitalkrishi.in" className="inline-flex items-center text-primary font-medium">
                support@digitalkrishi.in
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>

            <div className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-150 ease-out transform-gpu hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01]">
              <div className="mb-3 p-3 bg-primary/10 rounded-xl w-fit">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-1">Chat</h3>
              <p className="text-sm text-muted-foreground mb-3">Prefer messaging? Start a chat</p>
              <a href="#" className="inline-flex items-center text-primary font-medium">
                Open chat
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>

            <div className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-150 ease-out transform-gpu hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01]">
              <div className="mb-3 p-3 bg-primary/10 rounded-xl w-fit">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-1">Phone</h3>
              <p className="text-sm text-muted-foreground mb-3">Mon–Fri, 9:00–18:00 IST</p>
              <a href="tel:+919999999999" className="inline-flex items-center text-primary font-medium">
                +91 99999 99999
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>

            <div className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-150 ease-out transform-gpu hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01]">
              <div className="mb-3 p-3 bg-primary/10 rounded-xl w-fit">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-1">Address</h3>
              <p className="text-sm text-muted-foreground">New Delhi, India</p>
            </div>
          </div>

          {/* Form */}
          <div className={`lg:col-span-3 ${contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} transition-all duration-1000`}>
            <div className="p-6 sm:p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
              <h2 className="text-2xl font-bold text-card-foreground mb-2">Send us a message</h2>
              <p className="text-muted-foreground mb-6">We usually respond within one business day.</p>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-card-foreground mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-card-foreground mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-card-foreground mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="How can we help?"
                    className="rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-card-foreground mb-2">Message</label>
                  <textarea
                    rows={6}
                    placeholder="Write your message here..."
                    className="rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-between gap-4">
                  <div className="text-xs text-muted-foreground">
                    By sending this message, you agree to our terms and privacy policy.
                  </div>
                  <button
                    type="button"
                    className="group bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-150 ease-out inline-flex items-center justify-center transform-gpu"
                  >
                    Send Message
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
