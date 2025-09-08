import Link from "next/link";
import { Sprout } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Digital Krishi Officer</span>
            </div>
            <p className="text-muted-foreground">
              AI-powered agricultural advisory system for Kerala farmers.
            </p>
          </div>

          {/* Quick Links */}
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
                  href="#features"
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

          {/* Support Section */}
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

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>
            &copy; {currentYear} Digital Krishi Officer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
