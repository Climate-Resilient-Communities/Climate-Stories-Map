export const STORY_PROMPTS = [
  'A moment that stayed with me',
  "A change I've noticed over time",
  "A challenge I'm facing",
  'Something I lost',
  "Something I'm protecting",
  "Something I'm proud of",
  'A solution I believe in',
  'A question I have',
  'Lived experience / One-time event',
  'Personal action I took',
  'Community action',
  "Something I'm worried about",
  'Something that gives me hope',
] as const;

export type StoryPromptType = typeof STORY_PROMPTS[number];
