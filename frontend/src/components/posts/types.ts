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
    tags: string[];
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
    tags: string[];
    captchaToken: string;
  }
  