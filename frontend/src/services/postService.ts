import axios from 'axios';
import { Post, PostFormData } from '../components/posts/types';
import { transformKeysToCamel } from '../utils/caseTransformers';

const API_URL = import.meta.env.VITE_POST_API_URL || '/api/posts';

export const fetchPosts = async (tag?: string, optionalTags?: string[]): Promise<Post[]> => {
  try {
    let url = API_URL;
    const params: Record<string, string | string[]> = {};
    
    if (tag && typeof tag === 'string' && tag.trim() !== '') {
      params.tag = tag.trim();
    }
    
    if (optionalTags && Array.isArray(optionalTags) && optionalTags.length > 0) {
      params.optionalTags = optionalTags.filter(t => typeof t === 'string' && t.trim());
    }
    
    const response = await axios.get(url, { params });
    return transformKeysToCamel(response.data);
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Failed to fetch posts');
  }
};

export const fetchPostById = async (id: string): Promise<Post> => {
  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    throw new Error('Invalid ID format');
  }
  const response = await axios.get(`${API_URL}/${id}`);
  return transformKeysToCamel(response.data);
};

export const createPost = async (postData: PostFormData): Promise<Post> => {
  const response = await axios.post(`${API_URL}/create`, postData);
  return transformKeysToCamel(response.data);
};

export const updatePost = async (id: string, postData: PostFormData): Promise<Post> => {
  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    throw new Error('Invalid ID format');
  }
  const response = await axios.put(`${API_URL}/update/${id}`, postData);
  return transformKeysToCamel(response.data);
};

export const deletePost = async (id: string): Promise<void> => {
  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    throw new Error('Invalid ID format');
  }
  await axios.delete(`${API_URL}/delete/${id}`);
};