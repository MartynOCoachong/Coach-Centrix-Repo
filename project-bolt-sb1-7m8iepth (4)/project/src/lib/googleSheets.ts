import { useState, useEffect } from 'react';

interface SheetData {
  values: any[][];
  error?: string;
}

export const useGoogleSheets = (sheetName: string = 'Sessions') => {
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Remove any quotes from the sheet name and handle spaces
        const sanitizedSheetName = sheetName.replace(/['"`]/g, '').split('!')[0];
        
        const response = await fetch(`/api/sheets/${encodeURIComponent(sanitizedSheetName)}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch sheet data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching sheet data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sheetName]);

  return { data, loading, error };
};