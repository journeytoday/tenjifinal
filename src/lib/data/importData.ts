import { supabase } from '../supabase';

// Normalize JSON Keys for Case Insensitivity
const normalizeKeys = (data: any): any => {
  if (typeof data !== 'object' || data === null) return data;
  if (Array.isArray(data)) return data.map(normalizeKeys);
  
  return Object.entries(data).reduce((acc: any, [key, value]) => {
    acc[key.toLowerCase()] = normalizeKeys(value);
    return acc;
  }, {});
};

// Insert Protocol Data
export const insertProtocolData = async (data: any) => {
  const normalizedData = normalizeKeys(data);
  const rootData = normalizedData.result || normalizedData;
  const protocol = {
    id: rootData.protocolid,
    title: rootData.protocoltitle,
    date: rootData.protocoldate,
    legislature_period: rootData.legislatureperiod,
    protocol_number: rootData.protocolnumber,
    agenda_items_count: rootData.agendaitemscount,
    mongo_id: rootData.mongoid
  };

  const { error } = await supabase
    .from('protocols')
    .upsert(protocol, { onConflict: 'id' });

  if (error) throw error;
  return protocol;
};

// Insert Agenda Items Data
export const insertAgendaItemsData = async (data: any) => {
  const normalizedData = normalizeKeys(data);
  const rootData = normalizedData.result || normalizedData;
  const agendaItems = rootData.agendaitems || [];

  const formattedAgendaItems = agendaItems.map((item: any) => ({
    id: item.agendaitemid,
    protocol_id: rootData.protocolid,
    title: item.agendaitemtitle,
    description: item.agendaitemdescription,
    agenda_item_number: item.agendaitemnumber,
    item_order: item.agendaorder,
    date: item.agendadate
  }));

  if (formattedAgendaItems.length > 0) {
    const { error } = await supabase
      .from('agenda_items')
      .upsert(formattedAgendaItems, { onConflict: 'id' });

    if (error) throw error;
  }

  return formattedAgendaItems;
};

// Insert Speech Data
export const insertSpeechData = async (data: any) => {
  const normalizedData = normalizeKeys(data);
  const rootData = normalizedData.result || normalizedData;
  const speeches: any[] = [];

  // Extract speeches from agenda items
  rootData.agendaitems?.forEach((agendaItem: any) => {
    agendaItem.speeches?.forEach((speech: any) => {
      speeches.push({
        nlp_speech_id: speech.nlpspeechid,
        speaker_id: speech.speakerid,
        text: speech.speechtext,
        abstract_summary: speech.abstractsummary,
        agenda_item_id: agendaItem.agendaitemid
      });
    });
  });

  if (speeches.length > 0) {
    const { error } = await supabase
      .from('speeches')
      .upsert(speeches, { onConflict: 'nlp_speech_id' });

    if (error) throw error;
  }

  return speeches;
};

// Insert Speaker Data
export const insertSpeakerData = async (speakerData: any[]) => {
  const normalizedData = speakerData.map(speaker => {
    const data = normalizeKeys(speaker.result || speaker);
    return {
      speaker_id: data.speakerid,
      first_name: data.firstname,
      last_name: data.lastname,
      academic_title: data.academictitle,
      gender: data.gender,
      party: data.party,
      fraction: data.fraction
    };
  });

  if (normalizedData.length > 0) {
    const { error } = await supabase
      .from('speakers')
      .upsert(normalizedData, { onConflict: 'speaker_id' });

    if (error) throw error;
  }

  return normalizedData;
};

// Process JSON File
export const processJSONFile = async (file: File) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Process the data in sequence
    const protocol = await insertProtocolData(data);
    const agendaItems = await insertAgendaItemsData(data);
    const speeches = await insertSpeechData(data);
    
    return { protocol, agendaItems, speeches };
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
};

// Process Speaker JSON File
export const processSpeakerFile = async (file: File) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    return await insertSpeakerData(Array.isArray(data) ? data : [data]);
  } catch (error) {
    console.error('Error processing speaker file:', error);
    throw error;
  }
};