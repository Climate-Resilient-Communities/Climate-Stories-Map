import React, { useEffect, useState, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import './Map.css';
import './MapPopup.css';
import { MdMyLocation } from 'react-icons/md';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import mapboxgl from 'mapbox-gl';
import { Post } from './posts/types';
import { isPointInPolygon } from '../utils/map-utils';
import { useNotification } from './common/NotificationContext';
import { useTheme } from '../themes/ThemeContext';
import ImageModal from './common/ImageModal';
import { getFirstTopicTag, getTagColor, hexToRgba } from '../utils/tag-constants';
import { STORY_PROMPTS } from '../utils/story-prompts';
import TopicMarkerIcon from './markers/TopicMarkerIcon';

// Replace this with your actual Mapbox access token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MONOCHROME_MAP = import.meta.env.VITE_MONOCHROME_MAP;

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
  const [isGeocoderExpanded, setIsGeocoderExpanded] = useState(false);
  const { showNotification } = useNotification();
  const { theme } = useTheme();
  const mapRef = useRef<any>(null);
  const geocoderContainerRef = useRef<HTMLDivElement | null>(null);
  const geocoderRef = useRef<any | null>(null);

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
          console.log("Geolocation error or permission denied:", String(error).replace(/[\r\n\t]/g, ' '));
        }
      );
    }
  }, []);
  const [popupInfo, setPopupInfo] = useState<Post | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [modalImageAlt, setModalImageAlt] = useState('');

  const POPUP_MIN_W = 280;
  const POPUP_MIN_H = 240;
  const POPUP_MAX_W = 820;
  const POPUP_MAX_H = 700;
  const POPUP_DEFAULT_W = 350;
  const POPUP_DEFAULT_H = 400;

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const [popupSize, setPopupSize] = useState<{ width: number; height: number }>({
    width: POPUP_DEFAULT_W,
    height: POPUP_DEFAULT_H,
  });

  const resizeSessionRef = useRef<null | {
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  }>(null);

  const isResizingRef = useRef(false);

  const popupInfoRef = useRef<Post | null>(null);
  const popupSizeRef = useRef(popupSize);

  useEffect(() => {
    popupInfoRef.current = popupInfo;
  }, [popupInfo]);

  useEffect(() => {
    popupSizeRef.current = popupSize;
  }, [popupSize]);

  const centerMapForPopup = React.useCallback(
    (post: Post, size: { width: number; height: number }) => {
      if (!mapRef.current) return;

      const map = mapRef.current.getMap?.();
      if (!map) return;

      const container = map.getContainer?.();
      const rect = container?.getBoundingClientRect?.();
      const viewportHeight = rect?.height ?? window.innerHeight;

      // Target: marker moves toward the middle-bottom of the screen, with enough room above
      // for the story card (popup) to be fully visible.
      const popupHeight = size.height;
      const topPaddingPx = 24;
      const bottomPaddingPx = 90;
      const gapPx = 16;

      const minMarkerY = Math.ceil(popupHeight + topPaddingPx + gapPx);
      const preferredMarkerY = Math.floor(viewportHeight * 0.72);
      const maxMarkerY = Math.floor(viewportHeight - bottomPaddingPx);
      const targetMarkerY = Math.max(minMarkerY, Math.min(preferredMarkerY, maxMarkerY));

      // Horizontal: place marker at the true screen center.
      // If the map is shifted right by side UI (taskbar), rect.left will be > 0.
      const containerLeft = rect?.left ?? 0;
      const screenCenterX = window.innerWidth / 2;

      // Desired marker position inside the *map container* (pixel coordinates).
      // Note: map.project() / map.unproject() are in container coordinates.
      const desiredX = screenCenterX - containerLeft;
      const desiredY = targetMarkerY;

      const markerLngLat: [number, number] = [post.location.coordinates[0], post.location.coordinates[1]];
      const markerPx = map.project(markerLngLat);
      const centerPx = map.project(map.getCenter());
      const deltaX = markerPx.x - desiredX;
      const deltaY = markerPx.y - desiredY;

      const nextCenterPx = { x: centerPx.x + deltaX, y: centerPx.y + deltaY };
      const nextCenter = map.unproject(nextCenterPx);

      map.easeTo({
        center: nextCenter,
        duration: 1400,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        essential: true,
      });
    },
    []
  );

  const onResizeMove = React.useCallback((event: PointerEvent) => {
    const session = resizeSessionRef.current;
    if (!session) return;

    const nextWidth = clamp(session.startW + (event.clientX - session.startX), POPUP_MIN_W, POPUP_MAX_W);
    const nextHeight = clamp(session.startH + (event.clientY - session.startY), POPUP_MIN_H, POPUP_MAX_H);
    setPopupSize({ width: nextWidth, height: nextHeight });
  }, []);

  const onResizeEnd = React.useCallback(() => {
    resizeSessionRef.current = null;
    isResizingRef.current = false;
    document.body.classList.remove('popup-resizing');

    try {
      mapRef.current?.getMap?.()?.dragPan?.enable?.();
    } catch {
      // ignore
    }

    document.removeEventListener('pointermove', onResizeMove, true);
    document.removeEventListener('pointerup', onResizeEnd, true);
    document.removeEventListener('pointercancel', onResizeEnd, true);

    const info = popupInfoRef.current;
    if (info) {
      // Re-center after resizing so the marker stays tucked under the centered popup.
      centerMapForPopup(info, popupSizeRef.current);
    }
  }, [centerMapForPopup, onResizeMove]);

  const cleanupResizeSession = React.useCallback(() => {
    resizeSessionRef.current = null;
    isResizingRef.current = false;
    document.body.classList.remove('popup-resizing');

    try {
      mapRef.current?.getMap?.()?.dragPan?.enable?.();
    } catch {
      // ignore
    }

    document.removeEventListener('pointermove', onResizeMove, true);
    document.removeEventListener('pointerup', onResizeEnd, true);
    document.removeEventListener('pointercancel', onResizeEnd, true);
  }, [onResizeEnd, onResizeMove]);

  useEffect(() => {
    return () => {
      cleanupResizeSession();
    };
  }, [cleanupResizeSession]);

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Ignore if pointer capture isn't supported
    }

    resizeSessionRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startW: popupSize.width,
      startH: popupSize.height,
    };

    isResizingRef.current = true;

    try {
      mapRef.current?.getMap?.()?.dragPan?.disable?.();
    } catch {
      // ignore
    }

    document.body.classList.add('popup-resizing');
    document.addEventListener('pointermove', onResizeMove, true);
    document.addEventListener('pointerup', onResizeEnd, true);
    document.addEventListener('pointercancel', onResizeEnd, true);
  };
  
  const colorMapRef = useRef<Record<string, string>>({});

  const getMarkerColorByTag = (post: Post): string => {
    const { tag } = post;
    return getTagColor(tag);
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
      .catch((err) => console.error('Failed to load GeoJSON', String(err).replace(/[\r\n\t]/g, ' ')));
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current.resize(), 350);
    }
  }, [taskbarVisible]);

  useEffect(() => {
    if (!MAPBOX_TOKEN) return;

    let cancelled = false;

    const attachGeocoder = () => {
      if (cancelled) return;

      const map = mapRef.current?.getMap?.();
      if (!map || !geocoderContainerRef.current) {
        requestAnimationFrame(attachGeocoder);
        return;
      }

      if (geocoderRef.current) return;

      const geocoder = new MapboxGeocoder({
        accessToken: MAPBOX_TOKEN,
        mapboxgl,
        marker: false,
        flyTo: false,
        countries: 'ca',
        placeholder: 'Search a location in Canada',
        zoom: 10
      });

      geocoder.addTo(geocoderContainerRef.current);
      geocoder.on('result', (event: any) => {
        const center = event?.result?.center;
        if (Array.isArray(center) && center.length === 2 && mapRef.current) {
          mapRef.current.flyTo({
            center,
            zoom: 10,
            duration: 1500
          });

          // Clear previous search so the next location search starts clean.
          try {
            geocoder.clear();
          } catch {
            // ignore
          }

          // Also clear/blur the underlying input and collapse the UI.
          const input = geocoderContainerRef.current?.querySelector<HTMLInputElement>('input');
          if (input) {
            input.value = '';
            input.blur();
          }
          setIsGeocoderExpanded(false);
        }
      });

      geocoderRef.current = geocoder;
    };

    attachGeocoder();

    return () => {
      cancelled = true;
      if (geocoderRef.current) {
        geocoderRef.current.onRemove();
        geocoderRef.current = null;
      }
      if (geocoderContainerRef.current) {
        geocoderContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    if (!isGeocoderExpanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      const targetNode = event.target as Node | null;
      if (!targetNode) return;

      if (!geocoderContainerRef.current?.contains(targetNode)) {
        setIsGeocoderExpanded(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsGeocoderExpanded(false);
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGeocoderExpanded]);

  const focusGeocoderInput = () => {
    const input = geocoderContainerRef.current?.querySelector<HTMLInputElement>('input');
    if (input) {
      input.focus();
      input.select();
    }
  };



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
    <div className={`map-container ${taskbarVisible ? '' : 'taskbar-hidden'}${isCreatePostMode ? ' create-post-mode' : ''}`} style={{ position: 'relative' }}>
      {/* Location Search */}
      <div
        className={`map-geocoder ${isGeocoderExpanded ? 'expanded' : 'collapsed'} theme-${theme}`}
        ref={geocoderContainerRef}
        onMouseEnter={() => setIsGeocoderExpanded(true)}
        onMouseLeave={() => {
          const isFocusedWithin = !!geocoderContainerRef.current?.contains(document.activeElement);
          if (!isFocusedWithin) setIsGeocoderExpanded(false);
        }}
        onClick={() => {
          if (!isGeocoderExpanded) {
            setIsGeocoderExpanded(true);
            requestAnimationFrame(focusGeocoderInput);
          }
        }}
        onFocusCapture={() => setIsGeocoderExpanded(true)}
        aria-label="Search for a location"
      />

      {/* My Location Button */}
      <button
        className={`location-button theme-${theme}`}
        onClick={() => {
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { longitude, latitude } = position.coords;
                if (mapRef.current) {
                  mapRef.current.flyTo({
                    center: [longitude, latitude],
                    zoom: 12,
                    duration: 2000
                  });
                }
              },
              (error) => {
                if (error.code === 1) { // PERMISSION_DENIED
                  showNotification('Location access denied. Please enable location permissions in your browser settings and refresh the page.', true);
                } else if (error.code === 2) { // POSITION_UNAVAILABLE
                  showNotification('Location unavailable. Please check your GPS/location services.', true);
                } else if (error.code === 3) { // TIMEOUT
                  showNotification('Location request timed out. Please try again.', true);
                } else {
                  showNotification('Unable to access location. Please enable location permissions.', true);
                }
              }
            );
          } else {
            showNotification('Geolocation is not supported by this browser.', true);
          }
        }}
        title="Go to my location"
      >
        <MdMyLocation size={20} />
      </button>
      <Map
        ref={mapRef}
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
              onClick={e => {
                e.originalEvent.stopPropagation();
                setPopupInfo(post);
                setPopupSize({ width: POPUP_DEFAULT_W, height: POPUP_DEFAULT_H });
                cleanupResizeSession();

                // Center the story popup and pan so the marker sits under it.
                centerMapForPopup(post, { width: POPUP_DEFAULT_W, height: POPUP_DEFAULT_H });
              }}
            >
              <div
                className="topic-marker"
                style={{ ['--marker-color' as any]: color } as React.CSSProperties}
                aria-label={
                  `${post.title}. ` +
                  `${post.tag && post.tag !== '-' ? `Emotion: ${post.tag}. ` : ''}` +
                  `${getFirstTopicTag(post.optionalTags) ? `Topic: ${getFirstTopicTag(post.optionalTags)}.` : ''}`
                }
              >
                <svg
                  className="topic-marker__pin"
                  viewBox="0 0 24 24"
                  role="presentation"
                  aria-hidden="true"
                >
                  <path
                    d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"
                    fill="var(--marker-color)"
                    stroke="rgba(255, 255, 255, 0.95)"
                    strokeWidth="1.6"
                  />
                </svg>
                <span className="topic-marker__icon" aria-hidden="true">
                  <TopicMarkerIcon topicTag={getFirstTopicTag(post.optionalTags)} size={14} />
                </span>
              </div>
            </Marker>
          );
        })}

        {popupInfo && (
          <Popup
            longitude={popupInfo.location.coordinates[0]}
            latitude={popupInfo.location.coordinates[1]}
            anchor="bottom"
            offset={28}
            className="map-popup-story"
            onClose={() => {
              setPopupInfo(null);
              cleanupResizeSession();
            }}
            maxWidth="none"
          >
            <div
              className={`map-popup-content theme-${theme} map-popup-resizable`}
              style={{
                width: popupSize.width,
                height: popupSize.height,
              }}
            >
              <div className="map-popup-header">
                <h3 className="map-popup-title">{popupInfo.title}</h3>
              </div>
              <div className="map-popup-body">
                <p className="map-popup-description">{popupInfo.content.description}</p>
                {popupInfo.content.image && (
                  <img 
                    src={popupInfo.content.image} 
                    alt={popupInfo.title} 
                    className="map-popup-image" 
                    onClick={() => {
                      setModalImageSrc(popupInfo.content.image!);
                      setModalImageAlt(popupInfo.title);
                      setIsImageModalOpen(true);
                    }}
                    style={{ cursor: 'pointer' }}
                    title="Click to view full size"
                  />
                )}
              </div>
              <div className="map-popup-footer">
                <div className="map-popup-tags">
                  {popupInfo.tag && popupInfo.tag !== '-' && popupInfo.tag.trim() !== '' && (
                    <span
                      className="map-popup-tag"
                      style={{
                        backgroundColor: hexToRgba(getTagColor(popupInfo.tag), 0.15),
                        borderColor: getTagColor(popupInfo.tag),
                        color: getTagColor(popupInfo.tag),
                      }}
                    >
                      {popupInfo.tag}
                    </span>
                  )}
                  {popupInfo.optionalTags && popupInfo.optionalTags.length > 0 && popupInfo.optionalTags
                    .filter(tag => tag && tag.trim() !== '')
                    .filter(tag => !STORY_PROMPTS.includes(tag.trim() as any))
                    .map(tag => (
                      <span key={tag} className="map-popup-tag optional">{tag}</span>
                    ))
                  }
                </div>
                <div className="map-popup-date">
                  {new Date(popupInfo.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div
                className="map-popup-resize-handle"
                role="separator"
                aria-label="Resize popup"
                onPointerDown={startResize}
              />
            </div>
          </Popup>
        )}
      </Map>
      <ImageModal 
        isOpen={isImageModalOpen} 
        onClose={() => setIsImageModalOpen(false)} 
        imageSrc={modalImageSrc} 
        imageAlt={modalImageAlt} 
      />
    </div>
  );
};

export default CRCMap;