/**
 * Subject utilities - use subjects from Redux store (fetched from API)
 * formatSubject normalizes display; use store for the actual list
 */

export const formatSubject = (subject) => {
  if (!subject) return '';
  if (typeof subject !== 'string') return String(subject);
  return subject
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const normalizeSubject = formatSubject;
