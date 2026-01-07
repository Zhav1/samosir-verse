/**
 * Simple mapping for Latin to Surat Batak Toba.
 * This is a basic transliteration and might need a specific font mapping.
 * 
 * If using a font like "Surat Batak Toba", usually standard ASCII keys map to the glyphs.
 * However, some fonts use specific mappings.
 * 
 * For now, we will assume we are using a font where:
 * - a, i, u, e, o are vowels
 * - consonants are standard
 * - special characters might be needed for 'ng', 'ny', etc.
 * 
 * Since we don't have the font file yet, this function will just return the text
 * but wrapped in a way that we can apply the font class.
 */

export const toSuratBatak = (text: string): string => {
    // Placeholder for actual transliteration logic if needed.
    // For many Surat Batak fonts, you just type "Horas" and it renders correctly
    // IF the font supports the mapping. 
    // Some require "Ho-ra-s" or specific key combinations.
    
    // For this MVP, we will assume the font handles basic mapping or we just show the text
    // with the font applied.
    return text;
};



export const transliterateToBatak = (text: string): string => {
    const result = text.toLowerCase();
    
    // Apply common digraph replacements if the font requires it
    // Object.entries(REPLACEMENTS).forEach(([key, val]) => {
    //     result = result.replace(new RegExp(key, 'g'), val);
    // });

    return result;
};
