import { Post } from "../components/posts/types";
export const isFeaturedActive = (post: Post): boolean => {
    if (!post.featuredExpiresAt) return false;
    const raw = post.featuredExpiresAt as any;
    const dateStr = typeof raw === 'object' && raw['$date'] ? raw['$date'] : raw;
    return new Date(dateStr) > new Date();
};

