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
    // Add more filter logic here if needed
    return matchesSearch;
  });

  const toggleExpanded = (schemeId: string) => {
    setExpandedScheme(expandedScheme === schemeId ? null : schemeId);
  };

  const getSchemeIcon = (schemeName: string) => {
    if (schemeName.includes("PM-KISAN")) return "💰";
    if (schemeName.includes("PMFBY")) return "🛡️";
    if (schemeName.includes("Soil")) return "🌱";
    if (schemeName.includes("e-NAM")) return "🌐";
    if (schemeName.includes("RKVY")) return "📈";
    if (schemeName.includes("Krishi-DSS")) return "📊";
    return "🚜";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Government Schemes for Farmers
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover and apply for government schemes designed to support
              farmers across India
            </p>
            <div className="flex items-center justify-center space-x-6 text-lg">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 mr-2" />
                <span>{schemeData.metadata.total_schemes} Active Schemes</span>
              </div>
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 mr-2" />
                <span>Last Updated: {schemeData.metadata.last_updated}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search schemes by name, benefits, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value="all">All Schemes</option>
              <option value="financial">Financial Support</option>
              <option value="insurance">Insurance</option>
              <option value="technology">Technology</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredSchemes.length} of {schemes.length} schemes
          </p>
        </div>

        {/* Schemes Grid */}
        <div className="space-y-6">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.scheme_id}
              className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">
                      {getSchemeIcon(scheme.scheme_name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {scheme.scheme_name}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {scheme.objective}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpanded(scheme.scheme_id)}
                    className="flex items-center space-x-1 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
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

                {/* Key Benefits Preview */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Key Benefits
                    </h4>
                    <ul className="space-y-1">
                      {scheme.benefits.slice(0, 3).map((benefit, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start"
                        >
                          <span className="text-green-500 mr-2">•</span>
                          {benefit}
                        </li>
                      ))}
                      {scheme.benefits.length > 3 && (
                        <li className="text-sm text-primary">
                          +{scheme.benefits.length - 3} more benefits
                        </li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center">
                      <Users className="h-4 w-4 text-blue-500 mr-2" />
                      Eligibility
                    </h4>
                    <ul className="space-y-1">
                      {scheme.eligibility_criteria
                        .slice(0, 2)
                        .map((criteria, index) => (
                          <li
                            key={index}
                            className="text-sm text-muted-foreground flex items-start"
                          >
                            <span className="text-blue-500 mr-2">•</span>
                            {criteria}
                          </li>
                        ))}
                      {scheme.eligibility_criteria.length > 2 && (
                        <li className="text-sm text-primary">
                          +{scheme.eligibility_criteria.length - 2} more
                          criteria
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedScheme === scheme.scheme_id && (
                  <div className="border-t border-border pt-6 mt-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Full Benefits */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          All Benefits
                        </h4>
                        <ul className="space-y-2">
                          {scheme.benefits.map((benefit, index) => (
                            <li
                              key={index}
                              className="text-sm text-muted-foreground flex items-start"
                            >
                              <span className="text-green-500 mr-2 mt-1">
                                •
                              </span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Eligibility & Exclusions */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <Users className="h-5 w-5 text-blue-500 mr-2" />
                          Eligibility Criteria
                        </h4>
                        <ul className="space-y-2 mb-4">
                          {scheme.eligibility_criteria.map(
                            (criteria, index) => (
                              <li
                                key={index}
                                className="text-sm text-muted-foreground flex items-start"
                              >
                                <span className="text-blue-500 mr-2 mt-1">
                                  •
                                </span>
                                {criteria}
                              </li>
                            )
                          )}
                        </ul>

                        {scheme.exclusions.length > 0 && (
                          <>
                            <h4 className="font-semibold text-foreground mb-3 flex items-center">
                              <XCircle className="h-5 w-5 text-red-500 mr-2" />
                              Exclusions
                            </h4>
                            <ul className="space-y-2">
                              {scheme.exclusions.map((exclusion, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-muted-foreground flex items-start"
                                >
                                  <span className="text-red-500 mr-2 mt-1">
                                    •
                                  </span>
                                  {exclusion}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>

                      {/* Application Process */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <FileText className="h-5 w-5 text-purple-500 mr-2" />
                          How to Apply
                        </h4>
                        <ol className="space-y-2 mb-4">
                          {scheme.how_to_apply.map((step, index) => (
                            <li
                              key={index}
                              className="text-sm text-muted-foreground flex items-start"
                            >
                              <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">
                                {index + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>

                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <Phone className="h-5 w-5 text-orange-500 mr-2" />
                          Contact Information
                        </h4>
                        <ul className="space-y-2">
                          {scheme.whom_to_contact.map((contact, index) => (
                            <li
                              key={index}
                              className="text-sm text-muted-foreground flex items-start"
                            >
                              <span className="text-orange-500 mr-2 mt-1">
                                •
                              </span>
                              {contact}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Required Documents */}
                    <div className="mt-6 p-4 bg-accent/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-3 flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        Required Documents
                      </h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {scheme.required_documents.map((document, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm text-muted-foreground"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {document}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6">
                      <button
                        onClick={() => window.open(scheme.apply_url, "_blank")}
                        className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
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
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No schemes found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find relevant
              schemes.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-accent/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Need Help Finding the Right Scheme?
            </h3>
            <p className="text-muted-foreground mb-4">
              Contact our agricultural experts for personalized scheme
              recommendations
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/chat"
                className="flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <span className="mr-2">💬</span>
                Chat with AI Assistant
              </Link>
              <Link
                href="/contact"
                className="flex items-center px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <Phone className="h-5 w-5 mr-2" />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
