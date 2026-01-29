export const MAIN_TAGS = [
  'Anxious',
  'Overwhelmed',
  'Hopeful',
  'Empowered',
  'Frustrated',
  'Angry',
  'Concerned',
  'Sad/Grief',
  'Motivated',
  'Inspired',
  'Determined',
  'Resilient',
  'Fearful',
  'Curious',
] as const;

export type MainTagType = typeof MAIN_TAGS[number];

export const isMainTag = (tag: string): tag is MainTagType => {
  return MAIN_TAGS.includes(tag as MainTagType);
};

export const MAIN_TAG_COLORS: Record<MainTagType, string> = {
  Anxious: '#f59e0b',
  Overwhelmed: '#6366f1',
  Hopeful: '#22c55e',
  Empowered: '#10b981',
  Frustrated: '#f97316',
  Angry: '#ef4444',
  Concerned: '#0ea5e9',
  'Sad/Grief': '#3b82f6',
  Motivated: '#14b8a6',
  Inspired: '#a855f7',
  Determined: '#eab308',
  Resilient: '#16a34a',
  Fearful: '#111827',
  Curious: '#ec4899',
};

const LEGACY_TAG_COLORS: Record<'Positive' | 'Neutral' | 'Negative', string> = {
  Positive: '#22c55e',
  Neutral: '#06b6d4',
  Negative: '#ef4444',
};

export const DEFAULT_TAG_COLOR = '#94a3b8';

export const getTagColor = (tag?: string | null): string => {
  if (!tag) return DEFAULT_TAG_COLOR;
  if (isMainTag(tag)) return MAIN_TAG_COLORS[tag];
  if (tag === 'Positive' || tag === 'Neutral' || tag === 'Negative') return LEGACY_TAG_COLORS[tag];
  return DEFAULT_TAG_COLOR;
};

export const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length !== 6) return `rgba(148, 163, 184, ${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};