export const MAIN_TAGS = ['Positive', 'Negative', 'Neutral'] as const;

export type MainTagType = typeof MAIN_TAGS[number];

export const isMainTag = (tag: string): tag is MainTagType => {
  return MAIN_TAGS.includes(tag as MainTagType);
};