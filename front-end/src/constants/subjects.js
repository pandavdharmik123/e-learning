/**
 * Common subject list used across the entire application
 * This ensures consistency in subject selection and filtering
 */

export const SUBJECTS = [
  // Mathematics & Sciences
  'Mathematics',
  'Algebra',
  'Geometry',
  'Calculus',
  'Statistics',
  'Physics',
  'Chemistry',
  'Biology',
  'Science',
  
  'Environmental Science',
  
  // Languages & Literature
  'English',
  'English Literature',
  'Writing',
  'Reading',
  'Grammar',
  'Creative Writing',
  'Spanish',
  'French',
  'German',
  'Hindi',
  
  // Social Sciences
  'History',
  'Geography',
  'Civics',
  'Social Studies',
  'Political Science',
  'Economics',
  
  // Arts & Humanities
  'Art',
  'Music',
  'Drama',
  'Theater',
  'Philosophy',
  'Religion',
  
  // Technology & Computer Science
  'Computer Science',
  'Programming',
  'Web Development',
  'Data Science',
  'Information Technology',
  
  // Business & Commerce
  'Business Studies',
  'Accounting',
  'Finance',
  'Marketing',
  'Management',
  
  // Physical Education & Health
  'Physical Education',
  'Health',
  'Sports',
  
  // Test Preparation
  'SAT Preparation',
  'ACT Preparation',
  'GRE Preparation',
  'GMAT Preparation',
  'IELTS Preparation',
  'TOEFL Preparation',
];

/**
 * Get subject options for Ant Design Select component
 * @returns {Array} Array of { label, value } objects
 */
export const getSubjectOptions = () => {
  return SUBJECTS.map(subject => ({
    label: subject,
    value: subject.toLowerCase().replace(/\s+/g, '_'), // Convert to lowercase with underscores
  }));
};

/**
 * Get subject options for Ant Design Select component (with display labels)
 * @returns {Array} Array of JSX Option elements
 */
export const getSubjectSelectOptions = () => {
  return SUBJECTS.map(subject => ({
    value: subject.toLowerCase().replace(/\s+/g, '_'),
    label: subject,
  }));
};

/**
 * Normalize subject to match the format in SUBJECTS array (capitalized)
 * @param {string} subject - Subject value in any format
 * @returns {string} Normalized subject matching SUBJECTS array
 */
export const normalizeSubject = (subject) => {
  if (!subject) return '';
  // Try to find exact match first (case-insensitive)
  const exactMatch = SUBJECTS.find(s => 
    s.toLowerCase().replace(/\s+/g, '_') === subject.toLowerCase().replace(/\s+/g, '_')
  );
  if (exactMatch) return exactMatch;
  
  // If no exact match, try to format it
  return subject
    .split(/[_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format subject value for display (capitalize and replace underscores)
 * @param {string} subject - Subject value (e.g., "mathematics" or "english_literature")
 * @returns {string} Formatted subject (e.g., "Mathematics" or "English Literature")
 */
export const formatSubject = (subject) => {
  return normalizeSubject(subject);
};

/**
 * Normalize an array of subjects to match SUBJECTS format
 * @param {Array<string>} subjects - Array of subject strings
 * @returns {Array<string>} Normalized array of subjects
 */
export const normalizeSubjects = (subjects) => {
  if (!Array.isArray(subjects)) return [];
  return subjects.map(normalizeSubject).filter(Boolean);
};

/**
 * Check if a subject exists in the list
 * @param {string} subject - Subject to check
 * @returns {boolean}
 */
export const isValidSubject = (subject) => {
  if (!subject) return false;
  const normalized = subject.toLowerCase().replace(/\s+/g, '_');
  return SUBJECTS.some(s => s.toLowerCase().replace(/\s+/g, '_') === normalized);
};
