import Link from "next/link";
import {
  Sprout,
  MessageCircle,
  Users,
  Shield,
  Globe,
  ArrowRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Home() {
  return (
    <div className="flex-1">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Sprout className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">
                Digital Krishi Officer
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-8">
                <Link
                  href="#features"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/chat"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Chat
                </Link>
                <Link
                  href="/login"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </Link>
              </div>
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Your AI-Powered
            <span className="text-primary block">Agricultural Advisor</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Get expert farming advice in Malayalam, 24/7. From crop diseases to
            weather decisions, our AI understands Kerala farming like a local
            Krishi Officer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center"
            >
              Start Farming Smarter
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="border-2 border-primary text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need for Smart Farming
            </h3>
            <p className="text-xl text-muted-foreground">
              Comprehensive agricultural support designed for Kerala farmers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-border">
              <MessageCircle className="h-12 w-12 text-primary mb-4" />
              <h4 className="text-xl font-semibold text-card-foreground mb-3">
                Malayalam Support
              </h4>
              <p className="text-muted-foreground">
                Ask questions in Malayalam and get responses in your native
                language. No language barriers in farming advice.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-border">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h4 className="text-xl font-semibold text-card-foreground mb-3">
                Crop Disease Detection
              </h4>
              <p className="text-muted-foreground">
                Upload photos of your crops and get instant disease
                identification with treatment recommendations.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-border">
              <Globe className="h-12 w-12 text-primary mb-4" />
              <h4 className="text-xl font-semibold text-card-foreground mb-3">
                Local Weather Insights
              </h4>
              <p className="text-muted-foreground">
                Get weather-based farming advice tailored to Kerala's climate
                and seasonal patterns.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-border">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h4 className="text-xl font-semibold text-card-foreground mb-3">
                Expert Escalation
              </h4>
              <p className="text-muted-foreground">
                Complex issues are automatically escalated to local agricultural
                officers for human expertise.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-border">
              <Sprout className="h-12 w-12 text-primary mb-4" />
              <h4 className="text-xl font-semibold text-card-foreground mb-3">
                Crop-Specific Advice
              </h4>
              <p className="text-muted-foreground">
                Tailored recommendations for rice, coconut, spices, and other
                crops common in Kerala.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-border">
              <MessageCircle className="h-12 w-12 text-primary mb-4" />
              <h4 className="text-xl font-semibold text-card-foreground mb-3">
                24/7 Availability
              </h4>
              <p className="text-muted-foreground">
                Get farming advice anytime, anywhere. Your digital Krishi
                Officer never sleeps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Farming?
          </h3>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of Kerala farmers who are already using AI to improve
            their crops and increase yields.
          </p>
          <Link
            href="/register"
            className="bg-primary-foreground text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-foreground/90 transition-colors inline-flex items-center"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sprout className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">
                  Digital Krishi Officer
                </span>
              </div>
              <p className="text-muted-foreground">
                AI-powered agricultural advisory system for Kerala farmers.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-secondary-foreground transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="hover:text-secondary-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-secondary-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-secondary-foreground transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-secondary-foreground transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-secondary-foreground transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/feedback"
                    className="hover:text-secondary-foreground transition-colors"
                  >
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Digital Krishi Officer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
