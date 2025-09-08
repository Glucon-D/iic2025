import { NextRequest, NextResponse } from 'next/server';
import { MandiService } from '@/services/mandiService';
import { MandiAPIParams } from '@/utils/types/mandi.types';

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Handle DD/MM/YYYY format
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  
  // Handle standard formats
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  return null;
}



export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const params: MandiAPIParams = {
      offset: Number(searchParams.get('offset') || 0),
      limit: Number(searchParams.get('limit') || 500),
      format: (searchParams.get('format') as 'json' | 'csv') || 'json',
      filters: {
        state: searchParams.get('state') || undefined,
        district: searchParams.get('district') || undefined,
        market: searchParams.get('market') || undefined,
        commodity: searchParams.get('commodity') || undefined,
        variety: searchParams.get('variety') || undefined,
        grade: searchParams.get('grade') || undefined,
      }
    };

    const data = await MandiService.fetchMarketPrices(params);

    if (data.records && data.records.length > 0) {
      // Sort by date (newest first) - handle various date formats
      data.records.sort((a, b) => {
        const dateA = parseDate(a.Arrival_Date || a.arrival_date || '');
        const dateB = parseDate(b.Arrival_Date || b.arrival_date || '');
        
        // If either date is invalid, push to end
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        return dateB.getTime() - dateA.getTime();
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in market pricing API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch market pricing data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { field } = body;

    if (!field) {
      return NextResponse.json(
        { error: 'Field parameter is required' },
        { status: 400 }
      );
    }

    const uniqueValues = await MandiService.getUniqueValues(field);
    
    return NextResponse.json({ values: uniqueValues });
  } catch (error) {
    console.error('Error fetching unique values:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch unique values',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}