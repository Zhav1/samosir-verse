import { useAppStore } from '@/store/useAppStore';
import { translations, Language } from '@/lib/translations';

// Helper type to access nested keys
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export const useTranslation = () => {
  const { language } = useAppStore();

  const t = (key: string): string => {
    const keys = key.split('.');
    let current: any = translations;

    for (const k of keys) {
      if (current[k] === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      current = current[k];
    }

    if (typeof current === 'object' && current !== null) {
        // Check if the current object has the language key
        if (language in current) {
            return current[language as Language];
        }
        // Fallback to English if specific language not found
        if ('en' in current) {
            return current['en'];
        }
    }

    return String(current);
  };

  return { t, language };
};
