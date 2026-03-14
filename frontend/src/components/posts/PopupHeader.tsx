import { Post } from "./types";
import { isFeaturedActive } from "../../utils/isFeaturedActive";
// Two header styles
const FeaturedHeader = ({ post }: { post: Post }) => (
    <div className="map-popup-header featured-header">
        <div className="icon-glass">
            <span className='sprout-logo'>🌿</span>
        </div>
        <h3 className="map-popup-title featured-title">{post.title}</h3>
    </div>
);

const StandardHeader = ({ post }: { post: Post }) => (
    <div className="map-popup-header">
        <h3 className="map-popup-title">{post.title}</h3>
    </div>
);

// Selector component
export const PopupHeader = ({ post }: { post: Post }) => {
    return isFeaturedActive(post)
        ? <FeaturedHeader post={post} />
        : <StandardHeader post={post} />;
};