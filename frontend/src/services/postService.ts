import axios from 'axios';
import { Post, PostFormData } from '../components/posts/types';
import { transformKeysToCamel } from '../utils/caseTransformers';

const API_URL = import.meta.env.VITE_POST_API_URL;

export const fetchPosts = async (tag?: string, optionalTags?: string[]): Promise<Post[]> => {
  let url = API_URL;
  const params: Record<string, string | string[]> = {};
  
  if (tag && tag.trim() !== '') {
    params.tag = tag;
  }
  
  if (optionalTags && optionalTags.length > 0) {
    params.optionalTags = optionalTags;
  }
  
  const response = await axios.get(url, { params });
  return transformKeysToCamel(response.data);
};

export const fetchPostById = async (id: string): Promise<Post> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return transformKeysToCamel(response.data);
};

export const createPost = async (postData: PostFormData): Promise<Post> => {
  const response = await axios.post(`${API_URL}/create`, postData);
  return transformKeysToCamel(response.data);
};

export const updatePost = async (id: string, postData: PostFormData): Promise<Post> => {
  const response = await axios.put(`${API_URL}/update/${id}`, postData);
  return transformKeysToCamel(response.data);
};

export const deletePost = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/delete/${id}`);
};