// Simple translation map for common German words
const germanTranslations: Record<string, string> = {
  'pharmacy': 'Apotheke',
  'medicine': 'Medizin',
  'health': 'Gesundheit',
  'doctor': 'Arzt',
  'hospital': 'Krankenhaus',
  'patient': 'Patient',
  'treatment': 'Behandlung',
  'drug': 'Medikament',
  'prescription': 'Rezept',
  'medical': 'medizinisch',
  'healthcare': 'Gesundheitswesen',
  'disease': 'Krankheit',
  'therapy': 'Therapie',
  'clinic': 'Klinik',
  'pharmaceutical': 'pharmazeutisch',
  'medication': 'Medikation',
  'pharmacist': 'Apotheker',
  'research': 'Forschung',
  'science': 'Wissenschaft',
  'study': 'Studie'
};

export const translateText = async (text: string, targetLang: string): Promise<string> => {
  // Split the text into words
  const words = text.toLowerCase().split(/\s+/);
  
  // Translate each word if it exists in our dictionary
  const translatedWords = words.map(word => germanTranslations[word] || word);
  
  // Join the words back together
  const translatedText = translatedWords.join(' ');
  
  // Return both original and translated text for search
  return translatedText;
};