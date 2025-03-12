import React, { useEffect, useState, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';
import './MapPopup.css';
import { Post } from './posts/types';
import { isPointInPolygon } from '../utils/map-utils';

// Replace this with your actual Mapbox access token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Marker color constants
const MARKER_COLOR_NEUTRAL = "rgb(74, 163, 192)";
const MARKER_COLOR_NEGATIVE = "rgb(225, 81, 81)";
const MARKER_COLOR_POSITIVE = "rgb(104, 244, 132)";

interface MapProps {
  posts: Post[];
  onMapClick: (coordinates: [number, number], event: React.MouseEvent<HTMLDivElement>) => void;
  selectedTags?: string[];
}

const CRCMap: React.FC<MapProps> = ({ posts, onMapClick }) => {
  const [canadaGeoJSON, setCanadaGeoJSON] = useState<any | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -75.6972,
    latitude: 45.4215,
    zoom: 4
  });
  const [popupInfo, setPopupInfo] = useState<Post | null>(null);
  
  // Create a ref to store post IDs and their colors
  const colorMapRef = useRef<Record<string, string>>({});

  // Function to determine marker color based on tag only (not affected by filters)
  const getMarkerColorByTag = (post: Post): string => {
    const { tag } = post;
    
    // Always use consistent coloring based on the post's tag
    if (tag === 'Negative') {
      return MARKER_COLOR_NEGATIVE;
    } else if (tag === 'Positive') {
      return MARKER_COLOR_POSITIVE;
    }
    return MARKER_COLOR_NEUTRAL; // Default color for neutral
  };

  // Initialize and update colors for all posts
  useEffect(() => {
    // For each post, either use its existing color or assign a new one based on its tag and filters
    posts.forEach(post => {
      // Always update the color based on the post's tag and selected tags
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
        alert("You can only click within Canada!");
      }
    }
  };

  return (
    <div className="map-container">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={handleClick}
        minZoom={4}
        maxZoom={20}
        maxBounds={[
          [-141.002197, 41.676556], // Southwest coordinates
          [-52.620281, 83.110626]   // Northeast coordinates
        ]}
      >
        <NavigationControl />
        
        { false && (<div>
        {canadaGeoJSON && (
          <>
            {/* Grey background for world */}
            <Source id="world-grey" type="geojson" data={{
              type: 'FeatureCollection',
              features: [
                {
                  properties: {},
                  type: 'Feature',
                  geometry: {
                    type: 'Polygon',
                    coordinates: [[
                      [-180, 90],
                      [180, 90],
                      [180, -90],
                      [-180, -90],
                      [-180, 90]
                    ]]
                  }
                }
              ]
            }}>
              <Layer
                id="world-grey-background"
                type="fill"
                paint={{
                  'fill-color': '#808080',
                  'fill-opacity': 1
                }}
              />
            </Source>

            {/* Mask to cut out Canada from the grey background */}
            <Source id="canada-mask-source" type="geojson" data={{
              type: 'FeatureCollection',
              features: [
                {
                  properties: {},
                  type: 'Feature',
                  geometry: {
                    type: 'Polygon',
                    coordinates: [
                      [
                        [-180, 90],
                        [180, 90],
                        [180, -90],
                        [-180, -90],
                        [-180, 90]
                      ],
                      ...canadaGeoJSON.features.map((feature: any) => feature.geometry.coordinates).flat()
                    ]
                  }
                }
              ]
            }}>
              <Layer
                id="canada-mask"
                type="fill"
                paint={{
                  'fill-color': '#ffffff',
                  'fill-opacity': 0
                }}
                beforeId="world-grey-background"
              />
            </Source>

            {/* Canada border */}
            <Source id="canada-source" type="geojson" data={canadaGeoJSON}>
              <Layer
                id="canada-border"
                type="line"
                paint={{
                  'line-color': '#000000',
                  'line-width': 2
                }}
              />
            </Source>
          </>
        )}</div>)}

        {posts.map((post) => {
          // Use the stored color from colorMapRef if available, otherwise calculate it
          // This ensures colors stay consistent when filtering
          let color = colorMapRef.current[post._id];
          
          // If color is not in the map (should not happen, but as fallback)
          if (!color) {
            // Get color using the reusable function
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