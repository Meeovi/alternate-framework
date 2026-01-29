// Function to easily format a mailto link. Encodes the subject and body to preserve formatting.
export function createMailto(to, { subject, body, cc, bcc } = {}) {
    const params = [
        subject && `subject=${encodeURIComponent(subject)}`,
        body && `body=${encodeURIComponent(body)}`,
        cc && `cc=${encodeURIComponent(cc)}`,
        bcc && `bcc=${encodeURIComponent(bcc)}`,
    ]
        .filter(Boolean)
        .join('&');
    return `mailto:${to}?${params}`;
}
export function createTel(phoneNumber) {
    // Remove all non-numeric characters
    const cleanedNumber = phoneNumber.replace(/\D+/g, '');
    // Check if the number has a country code (e.g., +1 for the US)
    if (cleanedNumber.length > 10 && cleanedNumber.startsWith('1')) {
        return `tel:+${cleanedNumber}`;
    }
    return `tel:${cleanedNumber}`;
}
