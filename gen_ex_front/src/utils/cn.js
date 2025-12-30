/**
 * Utility function to merge and deduplicate Tailwind CSS classes
 * @param  {...string} classes - CSS class strings to merge
 * @returns {string} Merged class string
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}