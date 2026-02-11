import type { MainTagType } from '../../utils/tag-constants';

export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface PostContent {
  description: string;
  image?: string;
}

export interface Post {
  _id: string;
  title: string;
  content: PostContent;
  location: Location;
  tag: string;
  optionalTags: string[];
  storyPrompt?: string;
  createdAt: string;
}

export interface PostFormData {
  title: string;
  content: {
    description: string;
  };
  location: {
    type: string;
    coordinates: [number, number];
  };
  optionalTags: string[];
  tag: '-' | MainTagType;
  storyPrompt?: string;
  captchaToken: string;
}