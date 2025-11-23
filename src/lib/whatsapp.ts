/**
 * WhatsApp Deep Link Utility
 * Generates WhatsApp links for direct messaging
 */

/**
 * Formats phone number to international format
 * Assumes Indonesian numbers (62)
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 62
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  
  // If doesn't start with 62, add it
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  
  return cleaned;
}

/**
 * Generates a WhatsApp deep link with pre-filled message
 * @param phoneNumber - Phone number (can be in any format: 0812xxx, 62812xxx, +62812xxx)
 * @param message - Pre-filled message text
 * @returns WhatsApp URL
 */
export function generateWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const encodedMessage = encodeURIComponent(message);
  
  // Use wa.me for universal compatibility (works on desktop & mobile)
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

/**
 * Generates a WhatsApp message for product inquiry
 */
export function generateProductInquiry(
  productName: string,
  price: number
): string {
  return `Horas! Saya tertarik dengan ${productName} (Rp ${price.toLocaleString('id-ID')}). Apakah masih tersedia?`;
}

/**
 * Opens WhatsApp in new window/tab
 */
export function openWhatsApp(phoneNumber: string, message: string): void {
  const link = generateWhatsAppLink(phoneNumber, message);
  window.open(link, '_blank', 'noopener,noreferrer');
}
