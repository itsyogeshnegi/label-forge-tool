/**
 * Generates a tracking number in the format LBL-YYYYMMDD-XXXXX
 * Example: LBL-20260606-58231
 */
export const generateTrackingNumber = () => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  
  // Generate a random 5-digit number (between 10000 and 99999)
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  
  return `LBL-${yyyy}${mm}${dd}-${randomDigits}`;
};
