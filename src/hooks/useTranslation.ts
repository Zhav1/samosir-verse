import { useAppStore } from '@/store/useAppStore';
import { translations, Language } from '@/lib/translations';


export const useTranslation = () => {
  const { language } = useAppStore();

  const t = (key: string): string => {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
