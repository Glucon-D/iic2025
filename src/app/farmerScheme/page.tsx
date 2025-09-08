"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ExternalLink,
  Users,
  FileText,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import schemeData from "@/utils/schemeData/schemeData.json";

interface Scheme {
  scheme_id: string;
  scheme_name: string;
  apply_url: string;
  objective: string;
  benefits: string[];
  eligibility_criteria: string[];
  exclusions: string[];
  how_to_apply: string[];
  whom_to_contact: string[];
  required_documents: string[];
}

export default function FarmerSchemePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedScheme, setExpandedScheme] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");

  const schemes: Scheme[] = schemeData.schemes;

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch =
      scheme.scheme_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.benefits.some((benefit) =>
        benefit.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (filterType === "all") return matchesSearch;

    // Filter by scheme type/category
    let matchesFilter = false;

    if (filterType === "financial") {
      // Financial support schemes - look for keywords in scheme name, objective, and benefits
      const financialKeywords = [
        "income support",
        "financial support",
        "direct benefit",
        "subsidy",
        "kisan samman",
        "pm-kisan",
        "money",
        "payment",
        "cash",
        "fund",
      ];
      matchesFilter = financialKeywords.some(
        (keyword) =>
          scheme.scheme_name.toLowerCase().includes(keyword) ||
          scheme.objective.toLowerCase().includes(keyword) ||
          scheme.benefits.some((benefit) =>
            benefit.toLowerCase().includes(keyword)
          )
      );
    } else if (filterType === "insurance") {
      // Insurance schemes - look for insurance-related keywords
      const insuranceKeywords = [
        "insurance",
        "bima",
        "coverage",
        "risk",
        "crop loss",
        "fasal bima",
        "pmfby",
        "premium",
        "claim",
      ];
      matchesFilter = insuranceKeywords.some(
        (keyword) =>
          scheme.scheme_name.toLowerCase().includes(keyword) ||
          scheme.objective.toLowerCase().includes(keyword) ||
          scheme.benefits.some((benefit) =>
            benefit.toLowerCase().includes(keyword)
          )
      );
    } else if (filterType === "technology") {
      // Technology schemes - look for tech-related keywords
      const technologyKeywords = [
        "digital",
        "online",
        "platform",
        "technology",
        "e-nam",
        "portal",
        "app",
        "system",
        "dss",
        "remote sensing",
        "geospatial",
        "data",
      ];
      matchesFilter = technologyKeywords.some(
        (keyword) =>
          scheme.scheme_name.toLowerCase().includes(keyword) ||
          scheme.objective.toLowerCase().includes(keyword) ||
          scheme.benefits.some((benefit) =>
            benefit.toLowerCase().includes(keyword)
          )
      );
    } else if (filterType === "development") {
      // Development programs - look for development-related keywords
      const developmentKeywords = [
        "development",
        "vikas",
        "health",
        "soil",
        "testing",
        "capacity building",
        "training",
        "infrastructure",
        "rkvy",
        "krishi vikas",
        "extension",
        "improvement",
      ];
      matchesFilter = developmentKeywords.some(
        (keyword) =>
          scheme.scheme_name.toLowerCase().includes(keyword) ||
          scheme.objective.toLowerCase().includes(keyword) ||
          scheme.benefits.some((benefit) =>
            benefit.toLowerCase().includes(keyword)
          )
      );
    }

    return matchesSearch && matchesFilter;
  });

  const toggleExpanded = (schemeId: string) => {
    setExpandedScheme(expandedScheme === schemeId ? null : schemeId);
  };

  const getSchemeIcon = (schemeName: string) => {
    if (schemeName.includes("PM-KISAN"))
      return (
        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
          <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
      );
    if (schemeName.includes("PMFBY"))
      return (
        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
      );
    if (schemeName.includes("Soil"))
      return (
        <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full">
          <Star className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
      );
    if (schemeName.includes("e-NAM"))
      return (
        <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
          <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
      );
    if (schemeName.includes("RKVY"))
      return (
        <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
          <TrendingUp className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
      );
    if (schemeName.includes("Krishi-DSS"))
      return (
        <div className="p-4 bg-cyan-100 dark:bg-cyan-900/30 rounded-full">
          <Star className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
        </div>
      );
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
        <Users className="h-8 w-8 text-gray-600 dark:text-gray-400" />
      </div>
    );
  };

  const handleApplyNow = (applyUrl: string) => {
    window.open(applyUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden mt-16">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float-slow">
          <CheckCircle className="h-8 w-8 text-primary/20" />
        </div>
        <div className="absolute top-40 right-20 animate-float-slower">
          <AlertCircle className="h-6 w-6 text-primary/30" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float">
          <div className="h-3 w-3 bg-primary/20 rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10 mt-8">
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Government Schemes for
            <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Farmers
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-md sm:text-lg md:text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
            Discover and apply for government schemes designed to support
            farmers across India with comprehensive benefits and easy
            application process.
          </p>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-xl mx-auto">
            <div className="group cursor-pointer bg-card border border-border rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-primary mr-3" />
                <div className="text-4xl font-bold text-primary">
                  {schemeData.metadata.total_schemes}
                </div>
              </div>
              <div className="text-muted-foreground text-md font-semibold">
                Active Schemes
              </div>
            </div>

            <div className="group cursor-pointer bg-card border border-border rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              <div className="flex items-center justify-center mb-2">
                <div className="text-3xl font-bold text-primary">
                  {schemeData.metadata.last_updated}
                </div>
              </div>
              <div className="text-muted-foreground text-md font-semibold">
                Last Updated
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search schemes by name, benefits, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background/80 backdrop-blur-sm transition-all duration-200"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-12 pr-8 py-4 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background/80 backdrop-blur-sm min-w-[180px] transition-all duration-200"
              >
                <option value="all">All Schemes</option>
                <option value="financial">Financial Support</option>
                <option value="insurance">Insurance</option>
                <option value="technology">Technology</option>
                <option value="development">Development Programs</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground font-medium">
              Showing{" "}
              <span className="text-primary font-bold">
                {filteredSchemes.length}
              </span>{" "}
              of{" "}
              <span className="text-primary font-bold">{schemes.length}</span>{" "}
              schemes
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live data</span>
            </div>
          </div>
        </div>

        {/* Schemes Grid */}
        <div className="space-y-8 mt-8">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.scheme_id}
              className="group bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-primary/30 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 transition-transform group-hover:scale-110 duration-300">
                      {getSchemeIcon(scheme.scheme_name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {scheme.scheme_name}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-base max-w-2xl">
                        {scheme.objective}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleApplyNow(scheme.apply_url)}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:from-primary/90 hover:to-primary transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Apply Now</span>
                    </button>
                    <button
                      onClick={() => toggleExpanded(scheme.scheme_id)}
                      className="flex items-center space-x-2 px-6 py-3 text-primary border border-primary/30 rounded-xl hover:bg-primary/10 transition-all duration-200 font-semibold"
                    >
                      <span>
                        {expandedScheme === scheme.scheme_id
                          ? "Less Info"
                          : "More Info"}
                      </span>
                      {expandedScheme === scheme.scheme_id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Key Benefits Preview */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl border border-green-200 dark:border-green-800/30">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Key Benefits
                    </h4>
                    <ul className="space-y-2">
                      {scheme.benefits.slice(0, 3).map((benefit, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          {benefit}
                        </li>
                      ))}
                      {scheme.benefits.length > 3 && (
                        <li className="text-sm text-primary font-medium pt-1">
                          +{scheme.benefits.length - 3} more benefits
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800/30">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center">
                      <Users className="h-5 w-5 text-blue-500 mr-2" />
                      Eligibility
                    </h4>
                    <ul className="space-y-2">
                      {scheme.eligibility_criteria
                        .slice(0, 2)
                        .map((criteria, index) => (
                          <li
                            key={index}
                            className="text-sm text-muted-foreground flex items-start"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            {criteria}
                          </li>
                        ))}
                      {scheme.eligibility_criteria.length > 2 && (
                        <li className="text-sm text-primary font-medium pt-1">
                          +{scheme.eligibility_criteria.length - 2} more
                          criteria
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedScheme === scheme.scheme_id && (
                  <div className="border-t border-border/50 pt-10 mt-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                      {/* Full Benefits */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold text-foreground mb-5 flex items-center">
                          <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                          All Benefits
                        </h4>
                        <ul className="space-y-4">
                          {scheme.benefits.map((benefit, index) => (
                            <li
                              key={index}
                              className="text-sm text-muted-foreground flex items-start leading-relaxed"
                            >
                              <span className="text-green-500 mr-3 mt-1.5 text-lg">
                                •
                              </span>
                              <span className="flex-1">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Eligibility & Exclusions */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-bold text-foreground mb-5 flex items-center">
                            <Users className="h-6 w-6 text-blue-500 mr-3" />
                            Eligibility Criteria
                          </h4>
                          <ul className="space-y-4">
                            {scheme.eligibility_criteria.map(
                              (criteria, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-muted-foreground flex items-start leading-relaxed"
                                >
                                  <span className="text-blue-500 mr-3 mt-1.5 text-lg">
                                    •
                                  </span>
                                  <span className="flex-1">{criteria}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        {scheme.exclusions.length > 0 && (
                          <div className="pt-6 border-t border-border/30">
                            <h4 className="text-lg font-bold text-foreground mb-5 flex items-center">
                              <XCircle className="h-6 w-6 text-red-500 mr-3" />
                              Exclusions
                            </h4>
                            <ul className="space-y-4">
                              {scheme.exclusions.map((exclusion, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-muted-foreground flex items-start leading-relaxed"
                                >
                                  <span className="text-red-500 mr-3 mt-1.5 text-lg">
                                    •
                                  </span>
                                  <span className="flex-1">{exclusion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Application Process */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-bold text-foreground mb-5 flex items-center">
                            <FileText className="h-6 w-6 text-purple-500 mr-3" />
                            How to Apply
                          </h4>
                          <ol className="space-y-4">
                            {scheme.how_to_apply.map((step, index) => (
                              <li
                                key={index}
                                className="text-sm text-muted-foreground flex items-start leading-relaxed"
                              >
                                <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-1 flex-shrink-0 font-semibold">
                                  {index + 1}
                                </span>
                                <span className="flex-1">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div className="pt-6 border-t border-border/30">
                          <h4 className="text-lg font-bold text-foreground mb-5 flex items-center">
                            <Phone className="h-6 w-6 text-orange-500 mr-3" />
                            Contact Information
                          </h4>
                          <ul className="space-y-4">
                            {scheme.whom_to_contact.map((contact, index) => (
                              <li
                                key={index}
                                className="text-sm text-muted-foreground flex items-start leading-relaxed"
                              >
                                <span className="text-orange-500 mr-3 mt-1.5 text-lg">
                                  •
                                </span>
                                <span className="flex-1">{contact}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Required Documents */}
                    <div className="mt-12 p-8 bg-gradient-to-r from-accent/30 to-accent/20 backdrop-blur-sm rounded-2xl border border-border/30">
                      <h4 className="text-lg font-bold text-foreground mb-6 flex items-center">
                        <FileText className="h-6 w-6 text-blue-500 mr-3" />
                        Required Documents
                      </h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scheme.required_documents.map((document, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm text-muted-foreground bg-background/50 p-4 rounded-xl border border-border/20 hover:bg-background/70 transition-colors"
                          >
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                            <span className="font-medium">{document}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-border/30">
                      <button
                        onClick={() => handleApplyNow(scheme.apply_url)}
                        className="flex items-center px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:from-primary/90 hover:to-primary transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-base"
                      >
                        <ExternalLink className="h-5 w-5 mr-3" />
                        Apply Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredSchemes.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              No schemes found
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try adjusting your search terms or filters to discover relevant
              government schemes for your needs.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-gradient-to-r from-accent/30 to-accent/20 backdrop-blur-sm mt-16 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Need Personalized Guidance?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
              Get expert advice from our agricultural specialists to find the
              most suitable schemes for your farming needs
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/chat"
                className="flex items-center px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:from-primary/90 hover:to-primary transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                <span className="mr-3 text-xl">💬</span>
                Chat with AI Assistant
              </Link>
              <Link
                href="/contact"
                className="flex items-center px-8 py-4 border border-border/50 rounded-xl hover:bg-accent/50 transition-all duration-200 font-medium"
              >
                <Phone className="h-5 w-5 mr-3" />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
