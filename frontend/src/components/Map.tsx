import React, { useEffect, useState } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';
import './Popup.css';
import { Post } from './posts/types';
import { isPointInPolygon } from '../utils/map-utils';

// Replace this with your actual Mapbox access token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapProps {
  posts: Post[];
  onMapClick: (coordinates: [number, number], event: React.MouseEvent<HTMLDivElement>) => void;
}

const CustomMap: React.FC<MapProps> = ({ posts, onMapClick }) => {
  const [canadaGeoJSON, setCanadaGeoJSON] = useState<any | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -75.6972,
    latitude: 45.4215,
    zoom: 4
  });
  const [popupInfo, setPopupInfo] = useState<Post | null>(null);

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
          // Determine marker color based on tags
          let color ="rgb(74, 163, 192)"; // Default color for neutral
          if (post.tags.some(tag => ['negative', 'bad', 'problem', 'issue', 'concern'].includes(tag.toLowerCase()))) {
            color = "rgb(225, 81, 81)";
          } else if (post.tags.some(tag => ['positive', 'good', 'great', 'excellent', 'happy'].includes(tag.toLowerCase()))) {
            color = "rgb(104, 244, 132)";
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
            <b>{popupInfo.title}</b>
            <br />
            {popupInfo.content.description}
            <br />
            <small>{new Date(popupInfo.created_at).toLocaleDateString()}</small>
            <br />
            {popupInfo.tags.map(tag => `#${tag}`).join(' ')}
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default CustomMap;