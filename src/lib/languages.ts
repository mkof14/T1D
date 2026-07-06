import type { Language } from '../types';

export type LanguageOption = {
  code: Language;
  label: string;
  full: string;
  native: string;
  flag: string;
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'EN', full: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'ru', label: 'RU', full: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'uk', label: 'UK', full: 'Ukrainian', native: 'Українська', flag: '🇺🇦' },
  { code: 'de', label: 'DE', full: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'ES', full: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'FR', full: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'pt', label: 'PT', full: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  { code: 'ja', label: 'JA', full: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: 'ZH', full: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'he', label: 'HE', full: 'Hebrew', native: 'עברית', flag: '🇮🇱' },
  { code: 'ar', label: 'AR', full: 'Arabic', native: 'العربية', flag: '🇸🇦' },
];
