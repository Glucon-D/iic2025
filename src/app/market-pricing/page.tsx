'use client';

import { useState, useEffect, useCallback } from 'react';
import { MandiRecord, MandiFilters } from '@/utils/types/mandi.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Navbar } from '@/components/ui/Navbar';
import { 
  Filter, 
  Download, 
  RefreshCw, 
  TrendingUp,
  MapPin,
  Package,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BarChart3
} from 'lucide-react';

export default function MarketPricingPage() {
  const [records, setRecords] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MandiFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showFilters, setShowFilters] = useState(true); // Show filters by default
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const recordsPerPage = 50;

  const [filterOptions, setFilterOptions] = useState<{
    states: string[];
    districts: string[];
    markets: string[];
    commodities: string[];
  }>({
    states: [],
    districts: [],
    markets: [],
    commodities: [],
  });

  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        offset: ((currentPage - 1) * recordsPerPage).toString(),
        limit: recordsPerPage.toString(),
        ...(filters.state && { state: filters.state }),
        ...(filters.district && { district: filters.district }),
        ...(filters.market && { market: filters.market }),
        ...(filters.commodity && { commodity: filters.commodity }),
      });

      const response = await fetch(`/api/market-pricing?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }

      const data = await response.json();
      
      if (data.status === 'ok' || data.records) {
        setRecords(data.records || []);
        setTotalRecords(data.total || data.count || 0);
      } else {
        setRecords([]);
        setTotalRecords(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/market-pricing?limit=500');
      const data = await response.json();
      
      if (data.records && data.records.length > 0) {
        const states = [...new Set(data.records.map((r: MandiRecord) => r.State || r.state).filter(Boolean))].sort() as string[];
        const districts = [...new Set(data.records.map((r: MandiRecord) => r.District || r.district).filter(Boolean))].sort() as string[];
        const markets = [...new Set(data.records.map((r: MandiRecord) => r.Market || r.market).filter(Boolean))].sort() as string[];
        const commodities = [...new Set(data.records.map((r: MandiRecord) => r.Commodity || r.commodity).filter(Boolean))].sort() as string[];
        
        setFilterOptions({
          states,
          districts,
          markets,
          commodities,
        });
      }
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  };

  useEffect(() => {
    fetchMarketData();
    fetchFilterOptions();
  }, [fetchMarketData]);

  const handleFilterChange = (key: keyof MandiFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const exportToCSV = () => {
    const headers = ['State', 'District', 'Market', 'Commodity', 'Variety', 'Grade', 'Min Price', 'Max Price', 'Modal Price'];
    const csvContent = [
      headers.join(','),
      ...records.map(record => [
        record.State || record.state || '',
        record.District || record.district || '',
        record.Market || record.market || '',
        record.Commodity || record.commodity || '',
        record.Variety || record.variety || '',
        record.Grade || record.grade || '',
        record.Min_Price || record.min_price || '',
        record.Max_Price || record.max_price || '',
        record.Modal_Price || record.modal_price || '',
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-prices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const formatPrice = (price: string | number) => {
    if (!price || price === '-') return '-';
    return `₹${price}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                <TrendingUp className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Live Market Prices
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Real-time commodity prices from mandis across India
            </p>
            <div className="flex items-center justify-center space-x-6 text-lg">
              <div className="flex items-center">
                <BarChart3 className="h-6 w-6 mr-2" />
                <span>{totalRecords.toLocaleString('en-IN')} Price Records</span>
              </div>
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 mr-2" />
                <span>Updated Daily</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Filter className="h-5 w-5" />
              {showFilters ? 'Hide' : 'Show'} Filters
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <button
              onClick={fetchMarketData}
              className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh Data
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    State
                  </label>
                  <select
                    value={filters.state || ''}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All States</option>
                    {filterOptions.states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    District
                  </label>
                  <select
                    value={filters.district || ''}
                    onChange={(e) => handleFilterChange('district', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Districts</option>
                    {filterOptions.districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Market
                  </label>
                  <select
                    value={filters.market || ''}
                    onChange={(e) => handleFilterChange('market', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Markets</option>
                    {filterOptions.markets.map(market => (
                      <option key={market} value={market}>{market}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Commodity
                  </label>
                  <select
                    value={filters.commodity || ''}
                    onChange={(e) => handleFilterChange('commodity', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Commodities</option>
                    {filterOptions.commodities.map(commodity => (
                      <option key={commodity} value={commodity}>{commodity}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Results Count and Export */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              Showing {records.length} of {totalRecords} price records
            </p>
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Error Loading Data</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchMarketData}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Market Data Available</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find pricing information.
            </p>
          </div>
        ) : (
          <>
            {/* Price Cards Grid for Mobile, Table for Desktop */}
            <div className="hidden lg:block">
              {/* Desktop Table */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-accent/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Commodity
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Min Price
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Max Price
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Modal Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {records.map((record, index) => (
                        <tr key={index} className="hover:bg-accent/30 transition-colors">
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-sm font-medium text-foreground">{record.Market || record.market || '-'}</div>
                              <div className="text-xs text-muted-foreground">
                                {record.District || record.district || '-'}, {record.State || record.state || '-'}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-sm font-medium text-foreground">{record.Commodity || record.commodity || '-'}</div>
                              <div className="text-xs text-muted-foreground">
                                {record.Variety || record.variety || '-'} • {record.Grade || record.grade || '-'}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-sm text-muted-foreground">{formatPrice(record.Min_Price || record.min_price || '')}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-sm text-muted-foreground">{formatPrice(record.Max_Price || record.max_price || '')}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {formatPrice(record.Modal_Price || record.modal_price || '')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {records.map((record, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground flex items-center">
                        <Package className="h-4 w-4 mr-2 text-primary" />
                        {record.Commodity || record.commodity || '-'}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {record.Variety || record.variety || '-'} • {record.Grade || record.grade || '-'}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleRowExpansion(index)}
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                      {expandedRows.has(index) ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {record.Market || record.market || '-'}, {record.District || record.district || '-'}, {record.State || record.state || '-'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="text-center p-2 bg-accent/30 rounded">
                        <p className="text-xs text-muted-foreground">Min</p>
                        <p className="text-sm font-medium">{formatPrice(record.Min_Price || record.min_price || '')}</p>
                      </div>
                      <div className="text-center p-2 bg-accent/30 rounded">
                        <p className="text-xs text-muted-foreground">Max</p>
                        <p className="text-sm font-medium">{formatPrice(record.Max_Price || record.max_price || '')}</p>
                      </div>
                      <div className="text-center p-2 bg-green-500/10 rounded">
                        <p className="text-xs text-muted-foreground">Modal</p>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {formatPrice(record.Modal_Price || record.modal_price || '')}
                        </p>
                      </div>
                    </div>


                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * recordsPerPage) + 1} to{' '}
                {Math.min(currentPage * recordsPerPage, totalRecords)} of {totalRecords} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-accent/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Need Help Understanding Market Trends?
            </h3>
            <p className="text-muted-foreground mb-4">
              Get personalized insights and recommendations from our AI assistant
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <BarChart3 className="h-5 w-5 mr-2" />
                View Price Trends
              </button>
              <button className="flex items-center px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors">
                <AlertCircle className="h-5 w-5 mr-2" />
                Set Price Alerts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}