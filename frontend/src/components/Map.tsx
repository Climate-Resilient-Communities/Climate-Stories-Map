import React, { useEffect, useState, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';
import './MapPopup.css';
import { Post } from './posts/types';
import { isPointInPolygon } from '../utils/map-utils';
import { useNotification } from './common/NotificationContext';
import { useTheme } from '../themes/ThemeContext';

// Replace this with your actual Mapbox access token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MONOCHROME_MAP = import.meta.env.VITE_MONOCHROME_MAP;

// Marker color constants
const MARKER_COLORS = {
  'Neutral': "rgb(74, 163, 192)",
  'Negative': "rgb(225, 81, 81)",
  'Positive': "rgb(104, 244, 132)"
} as const;

interface MapProps {
  posts: Post[];
  onMapClick: (coordinates: [number, number], event: React.MouseEvent<HTMLDivElement>) => void;
  onMapRightClick?: () => void;
  selectedTags?: string[];
  taskbarVisible?: boolean;
  isCreatePostMode?: boolean;
}

const CRCMap: React.FC<MapProps> = ({ posts, onMapClick, onMapRightClick, taskbarVisible = true, isCreatePostMode = false }) => {
  const [canadaGeoJSON, setCanadaGeoJSON] = useState<any | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -96.8283,  // Center of Canada
    latitude: 62.3947,
    zoom: 4
  });
  const { showNotification } = useNotification();
  const { theme } = useTheme();

  const getMapStyle = () => {
    return MONOCHROME_MAP;
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setViewState(prev => ({
            ...prev,
            longitude,
            latitude,
            zoom: 10
          }));
        },
        (error) => {
          console.log("Geolocation error or permission denied:", error);
        }
      );
    }
  }, []);
  const [popupInfo, setPopupInfo] = useState<Post | null>(null);
  
  const colorMapRef = useRef<Record<string, string>>({});

  const getMarkerColorByTag = (post: Post): string => {
    const { tag } = post;
    return MARKER_COLORS[tag as keyof typeof MARKER_COLORS] || MARKER_COLORS['Neutral'];
  };

  useEffect(() => {
    posts.forEach(post => {
      colorMapRef.current[post._id] = getMarkerColorByTag(post);
    });
    
    // This prevents the color map from growing indefinitely by removing entries for posts
    // that are no longer in the current filtered set
    const currentPostIds = new Set(posts.map(post => post._id));
    Object.keys(colorMapRef.current).forEach(postId => {
      if (!currentPostIds.has(postId)) {
        delete colorMapRef.current[postId];
      }
    });
  }, [posts]);

  useEffect(() => {
    fetch('/canada.geojson')
      .then((res) => res.json())
      .then((data) => setCanadaGeoJSON(data))
      .catch((err) => console.error('Failed to load GeoJSON', err));
  }, []);



  const handleClick = (event: any) => {
    const coordinates: [number, number] = [event.lngLat.lng, event.lngLat.lat];
    
    if (canadaGeoJSON) {
      const isInsideCanada = isPointInPolygon(coordinates, canadaGeoJSON);
      
      if (isInsideCanada) {
        const roundedLng = parseFloat(coordinates[0].toFixed(5));
        const roundedLat = parseFloat(coordinates[1].toFixed(5));
        onMapClick([roundedLng, roundedLat], event.originalEvent);
      } else {
        showNotification('You can only click within Canada!', true);
      }
    }
  };

  return (
    <div className={`map-container ${taskbarVisible ? '' : 'taskbar-hidden'}${isCreatePostMode ? ' create-post-mode' : ''}`}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={getMapStyle()}
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={handleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          if (onMapRightClick) {
            onMapRightClick();
          }
        }}
        minZoom={4}
        maxZoom={20}
        maxBounds={[
          [-141.002197, 41.676556], // Southwest coordinates
          [-52.620281, 83.110626]   // Northeast coordinates
        ]}
      >
        <NavigationControl />


        
        {posts.map((post) => {
          // Use the stored color from colorMapRef if available, otherwise calculate it
          // This ensures colors stay consistent when filtering
          let color = colorMapRef.current[post._id];
          
          if (!color) {
            color = getMarkerColorByTag(post);
          }
          
          return (
            <Marker
              key={post._id}
              longitude={post.location.coordinates[0]}
              latitude={post.location.coordinates[1]}
              anchor="bottom"
              color={color}
              onClick={e => {
                e.originalEvent.stopPropagation();
                setPopupInfo(post);
              }}
            />
          );
        })}

        {popupInfo && (
          <Popup
            longitude={popupInfo.location.coordinates[0]}
            latitude={popupInfo.location.coordinates[1]}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
          >
            <div className="map-popup-content">
              <b>{popupInfo.title}</b>
              <p>{popupInfo.content.description}</p>
              {popupInfo.content.image && (
                <img src={popupInfo.content.image} alt={popupInfo.title} className="map-popup-image" />
              )}
              <div className="map-popup-footer">
                <div>
                  {popupInfo.tag && popupInfo.tag !== '-' && popupInfo.tag.trim() !== '' && (
                    <span className={`map-popup-tag ${popupInfo.tag}`}>{popupInfo.tag}</span>
                  )}
                  {popupInfo.optionalTags && popupInfo.optionalTags.length > 0 && popupInfo.optionalTags
                    .filter(tag => tag && tag.trim() !== '')
                    .map(tag => (
                      <span key={tag} className="map-popup-tag">#{tag}</span>
                    ))
                  }
                </div>
              </div>
              <div className="map-popup-date">
                {new Date(popupInfo.createdAt).toLocaleDateString()}
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default CRCMap;