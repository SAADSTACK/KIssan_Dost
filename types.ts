export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface KissanResponse {
  advice_language: string;
  summary_heading: string;
  diagnosis_or_market_finding: string;
  actionable_steps: string[];
  long_term_strategy: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string | KissanResponse;
  image?: string; // Base64 string for user images
  isLoading?: boolean;
  groundingLinks?: { title: string; url: string }[];
  gradient?: string; // CSS class for gradient background
}

export type LanguageOption = 'Urdu' | 'Punjabi (Pakistani)' | 'English' | 'Sindhi' | 'Pashto';

export type FontSizeOption = 'small' | 'normal' | 'large';

export type ThemeId = 'green' | 'blue' | 'purple' | 'orange';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  gradient: string;
  primaryText: string;
  secondaryText: string;
  accentBg: string;
  accentBgHover: string;
  lightBg: string;
  border: string;
  ring: string;
  iconBg: string;
  iconText: string;
  welcomeGradient: string;
}