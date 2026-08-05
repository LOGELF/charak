import Dexie from 'dexie';

export const db = new Dexie('CharakHealthDB');

// Define database schema
db.version(1).stores({
  // Stores local symptom entries and photos
  symptoms: '++id, organ, checkDate, severity, notes, photoBase64',
  
  // Stores family tree members for Phase 4
  familyMembers: '++id, alias, relation, gender, status, cancerTypes, ageOfOnset'
});
