import { MandiRecord } from '@/utils/types/mandi.types';

export const generateMockMandiData = (count: number = 100): MandiRecord[] => {
  const states = ['Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Gujarat', 'Rajasthan', 'Karnataka', 'Tamil Nadu'];
  const districts = ['Nashik', 'Pune', 'Amritsar', 'Ludhiana', 'Gurgaon', 'Faridabad', 'Lucknow', 'Agra', 'Ahmedabad', 'Surat'];
  const markets = ['APMC Market', 'Central Market', 'Wholesale Market', 'Farmers Market', 'Grain Market'];
  const commodities = ['Wheat', 'Rice', 'Onion', 'Tomato', 'Potato', 'Cotton', 'Sugarcane', 'Maize', 'Pulses', 'Soybean'];
  const varieties = ['Local', 'Hybrid', 'Premium', 'Export Quality', 'Grade A', 'Grade B'];
  const grades = ['Fine', 'Super Fine', 'Medium', 'Coarse', 'FAQ'];

  const records: MandiRecord[] = [];

  for (let i = 0; i < count; i++) {
    const minPrice = Math.floor(Math.random() * 3000) + 1000;
    const maxPrice = minPrice + Math.floor(Math.random() * 2000);
    const modalPrice = Math.floor((minPrice + maxPrice) / 2);

    records.push({
      state: states[Math.floor(Math.random() * states.length)],
      district: districts[Math.floor(Math.random() * districts.length)],
      market: markets[Math.floor(Math.random() * markets.length)],
      commodity: commodities[Math.floor(Math.random() * commodities.length)],
      variety: varieties[Math.floor(Math.random() * varieties.length)],
      grade: grades[Math.floor(Math.random() * grades.length)],
      min_price: minPrice.toString(),
      max_price: maxPrice.toString(),
      modal_price: modalPrice.toString(),
      arrival_date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  }

  return records;
};