export interface MandiRecord {
  State?: string;
  District?: string;
  Market?: string;
  Commodity?: string;
  Variety?: string;
  Grade?: string;
  Arrival_Date?: string;
  Min_Price?: string;
  Max_Price?: string;
  Modal_Price?: string;
  Commodity_Code?: string;
  // Alternative field names for compatibility
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  grade?: string;
  arrival_date?: string;
  min_price?: string;
  max_price?: string;
  modal_price?: string;
}

export interface MandiAPIResponse {
  created: number;
  updated: number;
  created_date: string;
  updated_date: string;
  active: string;
  index_name: string;
  org: string[];
  org_type: string;
  source: string;
  title: string;
  external_ws_url: string;
  visualizable: string;
  field: unknown[];
  external_ws: number;
  catalog_uuid: string;
  sector: string[];
  target_bucket: {
    field: string;
    index: string;
    type: string;
  };
  desc: string;
  field_exposed: Array<{
    name: string;
    id: string;
    type: string;
  }>;
  message: string;
  version: string;
  status: string;
  total: number;
  count: number;
  limit: string;
  offset: string;
  records: MandiRecord[];
}

export interface MandiFilters {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  grade?: string;
  searchQuery?: string;
  dateRange?: string; // 'today' | '3days' | '7days' | '30days'
  fromDate?: string;
  toDate?: string;
}

export interface MandiAPIParams {
  offset?: number;
  limit?: number | 'all';
  format?: 'json' | 'csv';
  filters?: MandiFilters;
}