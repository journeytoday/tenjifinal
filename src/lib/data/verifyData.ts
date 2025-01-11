import { supabase } from '../supabase';

export interface DataCounts {
  protocols: number;
  agendaItems: number;
  speeches: number;
  speakers: number;
}

export interface SampleData {
  recentProtocols: any[];
  recentSpeeches: any[];
  speakerDetails: any[];
}

// Get counts from all tables
export const getDataCounts = async (): Promise<DataCounts> => {
  const counts = await Promise.all([
    supabase.from('protocols').select('*', { count: 'exact', head: true }),
    supabase.from('agenda_items').select('*', { count: 'exact', head: true }),
    supabase.from('speeches').select('*', { count: 'exact', head: true }),
    supabase.from('speakers').select('*', { count: 'exact', head: true })
  ]);

  return {
    protocols: counts[0].count || 0,
    agendaItems: counts[1].count || 0,
    speeches: counts[2].count || 0,
    speakers: counts[3].count || 0
  };
};

// Get sample data from each table
export const getSampleData = async (): Promise<SampleData> => {
  const [protocols, speeches, speakers] = await Promise.all([
    supabase
      .from('protocols')
      .select('*, agenda_items(*)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('speeches')
      .select('*, speakers(*)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('speakers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  return {
    recentProtocols: protocols.data || [],
    recentSpeeches: speeches.data || [],
    speakerDetails: speakers.data || []
  };
};