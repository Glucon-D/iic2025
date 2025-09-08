import Link from "next/link";
import { Mail, Phone, MapPin, Github, Twitter, Linkedin, Sprout } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-100 dark:from-gray-900 dark:via-green-900/10 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Company Info */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-xl flex-shrink-0">
                <Sprout className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent block">
                  Digital Krishi Officer
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400 -mt-1">AI Farm Assistant</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-sm sm:text-base">
              AI-powered agricultural advisory system helping farmers with expert advice on 
              pest management, crop planning, weather guidance, and government schemes.
            </p>
            {/* Social links with enhanced styling */}
            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                className="group p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-900 dark:hover:bg-white hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white dark:group-hover:text-gray-900 transition-colors duration-300" />
              </a>
              <a
                href="#"
                className="group p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-blue-500 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors duration-300" />
              </a>
              <a
                href="#"
                className="group p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-blue-700 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors duration-300" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 sm:mt-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center border-l-4 border-green-500 pl-3">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Quick Links
            </h3>
            <ul className="space-y-2 pl-3">
              <li>
                <Link
                  href="/"
                  className="group flex items-center space-x-3 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 py-1"
                >
                  <span className="w-1.5 h-1.5 bg-gray-400 group-hover:bg-green-500 rounded-full transition-colors duration-200"></span>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="group flex items-center space-x-3 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 py-1"
                >
                  <span className="w-1.5 h-1.5 bg-gray-400 group-hover:bg-green-500 rounded-full transition-colors duration-200"></span>
                  <span>About</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="group flex items-center space-x-3 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 py-1"
                >
                  <span className="w-1.5 h-1.5 bg-gray-400 group-hover:bg-green-500 rounded-full transition-colors duration-200"></span>
                  <span>Contact</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/chat"
                  className="group flex items-center space-x-3 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 py-1"
                >
                  <span className="w-1.5 h-1.5 bg-gray-400 group-hover:bg-green-500 rounded-full transition-colors duration-200"></span>
                  <span>Chat</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="mt-8 sm:mt-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center border-l-4 border-blue-500 pl-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Contact
            </h3>
            <ul className="space-y-3 pl-3">
              <li className="group">
                <div className="flex items-center space-x-3 py-1 hover:bg-green-50/50 dark:hover:bg-green-900/10 rounded-lg transition-all duration-200">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:bg-green-500 transition-colors duration-200">
                    <Mail className="w-3 h-3 text-green-600 dark:text-green-400 group-hover:text-white" />
                  </div>
                  <a
                    href="mailto:support@dko.com"
                    className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 text-sm break-all sm:break-normal"
                  >
                    support@dko.com
                  </a>
                </div>
              </li>
              <li className="group">
                <div className="flex items-center space-x-3 py-1 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-lg transition-all duration-200">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-200">
                    <Phone className="w-3 h-3 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                  </div>
                  <a
                    href="tel:+91-1234567890"
                    className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 text-sm"
                  >
                    +91-1234567890
                  </a>
                </div>
              </li>
              <li className="group">
                <div className="flex items-start space-x-3 py-1 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 rounded-lg transition-all duration-200">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-500 transition-colors duration-200 mt-0.5">
                    <MapPin className="w-3 h-3 text-purple-600 dark:text-purple-400 group-hover:text-white" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    Jaipur, India
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-6 border-t border-gray-200/70 dark:border-gray-700/70">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                © {currentYear} Digital Krishi Officer. All rights reserved.
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span className="hidden sm:inline">•</span>
                <span>Made with ❤️ for farmers</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center lg:justify-end items-center gap-4 sm:gap-6">
              <Link
                href="/privacy"
                className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm transition-colors duration-200 hover:underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm transition-colors duration-200 hover:underline underline-offset-4"
              >
                Terms of Service
              </Link>
              <Link
                href="/help"
                className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm transition-colors duration-200 hover:underline underline-offset-4"
              >
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
