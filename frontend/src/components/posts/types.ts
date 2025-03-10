export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface PostContent {
  description: string;
}

export interface Post {
  _id: string;
  title: string;
  content: PostContent;
  location: Location;
  tag: string;
  optionalTags: string[];
  created_at: string;
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
  tag: '-' | 'Positive' | 'Neutral' | 'Negative';
  captchaToken: string;
}