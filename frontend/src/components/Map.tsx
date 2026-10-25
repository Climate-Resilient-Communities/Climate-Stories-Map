import React, { useEffect, useState, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';
import './Map.mobile.css';
import './MapPopup.css';
import { MdClose, MdMyLocation, MdSearch } from 'react-icons/md';
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

interface SearchSuggestion {
  mapbox_id: string;
  name: string;
  place_formatted?: string;
  feature_type: string;
}

const createSearchSessionToken = () =>
  globalThis.crypto?.randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.random() * 16 | 0;
    return (character === 'x' ? random : (random & 0x3 | 0x8)).toString(16);
  });

const getPostImageUrl = (postId: string) => `/api/posts/${encodeURIComponent(postId)}/image`;

const isMobileViewportMatch = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(max-width: 768px) and (orientation: portrait)').matches;

interface MapProps {
  posts: Post[];
  onMapClick: (coordinates: [number, number], event: React.MouseEvent<HTMLDivElement>) => void;
  onMapRightClick?: () => void;
  selectedTags?: string[];
  taskbarVisible?: boolean;
  isCreatePostMode?: boolean;
}

const CRCMap: React.FC<MapProps> = ({ posts, onMapClick, onMapRightClick, taskbarVisible = true, isCreatePostMode = false }) => {
  const [isMobileViewport, setIsMobileViewport] = useState(isMobileViewportMatch);
  const [canadaGeoJSON, setCanadaGeoJSON] = useState<any | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -96.8283,  // Center of Canada
    latitude: 62.3947,
    zoom: 4
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isRetrievingSuggestion, setIsRetrievingSuggestion] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchAttribution, setSearchAttribution] = useState('');
  const { showNotification } = useNotification();
  const { theme } = useTheme();
  const mapRef = useRef<any>(null);
  const geocoderContainerRef = useRef<HTMLDivElement | null>(null);
  const searchSessionTokenRef = useRef(createSearchSessionToken());

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(max-width: 768px) and (orientation: portrait)');
    const handleViewportChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches);
    };

    mediaQuery.addEventListener('change', handleViewportChange);
    return () => mediaQuery.removeEventListener('change', handleViewportChange);
  }, []);

  const getMapStyle = () => {
    return MONOCHROME_MAP;
  };

  // Center on the user at load; some browsers (notably iOS Safari) may withhold the prompt without a tap, so the locate button remains the fallback.
  useEffect(() => {
    if (!("geolocation" in navigator) || !window.isSecureContext) return;
    const center = ({ coords }: GeolocationPosition) => {
      setViewState(prev => ({ ...prev, longitude: coords.longitude, latitude: coords.latitude, zoom: 10 }));
    };
    navigator.geolocation.getCurrentPosition(
      center,
      (error) => {
        if (error.code === 1) return;
        navigator.geolocation.getCurrentPosition(center, () => {}, {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);
  const [popupInfo, setPopupInfo] = useState<Post | null>(null);
  const [isPopupImageLoading, setIsPopupImageLoading] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [modalImageAlt, setModalImageAlt] = useState('');

  const getPopupBounds = (isMobile: boolean) => {
    if (!isMobile || typeof window === 'undefined') {
      return {
        minW: 280,
        minH: 240,
        maxW: 820,
        maxH: 700,
        defaultW: 350,
        defaultH: 400,
      };
    }

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const minW = 220;
    const minH = 170;
    const maxW = Math.max(minW, Math.min(320, viewportW - 36));
    const maxH = Math.max(minH, Math.min(420, Math.floor(viewportH * 0.56)));
    const defaultW = Math.max(minW, Math.min(285, maxW));
    const defaultH = Math.max(minH, Math.min(300, maxH));

    return {
      minW,
      minH,
      maxW,
      maxH,
      defaultW,
      defaultH,
    };
  };

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const [popupSize, setPopupSize] = useState<{ width: number; height: number }>(() => {
    const initialIsMobile = typeof window !== 'undefined' && !!window.matchMedia?.('(max-width: 768px) and (orientation: portrait)').matches;
    const initialBounds = getPopupBounds(initialIsMobile);
    return {
      width: initialBounds.defaultW,
      height: initialBounds.defaultH,
    };
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

    const bounds = getPopupBounds(isMobileViewport);

    const nextWidth = clamp(session.startW + (event.clientX - session.startX), bounds.minW, bounds.maxW);
    const nextHeight = clamp(session.startH + (event.clientY - session.startY), bounds.minH, bounds.maxH);
    setPopupSize({ width: nextWidth, height: nextHeight });
  }, [isMobileViewport]);

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

  useEffect(() => {
    if (!popupInfo) return;

    const bounds = getPopupBounds(isMobileViewport);
    setPopupSize((prev) => ({
      width: clamp(prev.width, bounds.minW, bounds.maxW),
      height: clamp(prev.height, bounds.minH, bounds.maxH),
    }));
  }, [isMobileViewport, popupInfo]);

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
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchSuggestions([]);
      setIsSearchLoading(false);
      return;
    }

    if (!MAPBOX_TOKEN) {
      setSearchError('Location search is not configured.');
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSearchLoading(true);
      setSearchError(null);

      const params = new URLSearchParams({
        q: query.slice(0, 256),
        country: 'CA',
        language: 'en',
        limit: '6',
        types: 'country,region,postcode,district,place,city,locality,neighborhood,block,street,address,poi',
        session_token: searchSessionTokenRef.current,
        access_token: MAPBOX_TOKEN
      });

      try {
        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/suggest?${params}`,
          { signal: controller.signal }
        );
        if (response.status === 401 || response.status === 403) {
          setSearchError('Mapbox denied location search. Check your token permissions for the Search Box API.');
          setSearchSuggestions([]);
          return;
        }
        if (!response.ok) {
          throw new Error(`Search Box API request failed with status ${response.status}`);
        }

        const data: { suggestions?: SearchSuggestion[]; attribution?: string } = await response.json();
        if (!controller.signal.aborted) {
          setSearchSuggestions(data.suggestions ?? []);
          setSearchAttribution(data.attribution ?? '');
          setActiveSuggestionIndex(-1);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Location search failed:', error);
          setSearchError('Location search is unavailable. Please try again.');
          setSearchSuggestions([]);
          setSearchAttribution('');
        }
      } finally {
        if (!controller.signal.aborted) setIsSearchLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    if (searchSuggestions.length === 0) return;
    const handlePointerDown = (event: PointerEvent) => {
      const targetNode = event.target as Node | null;
      if (!targetNode) return;

      if (!geocoderContainerRef.current?.contains(targetNode)) {
        setSearchSuggestions([]);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchSuggestions([]);
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchSuggestions.length]);

  const focusGeocoderInput = () => {
    const input = geocoderContainerRef.current?.querySelector<HTMLInputElement>('.map-search-input');
    if (input) {
      input.focus();
      input.select();
    }
  };

  const selectSearchSuggestion = async (suggestion: SearchSuggestion) => {
    if (!MAPBOX_TOKEN || isRetrievingSuggestion) return;

    setIsRetrievingSuggestion(true);
    setSearchError(null);
    const params = new URLSearchParams({
      session_token: searchSessionTokenRef.current,
      access_token: MAPBOX_TOKEN
    });

    try {
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(suggestion.mapbox_id)}?${params}`
      );
      if (response.status === 401 || response.status === 403) {
        setSearchError('Mapbox denied location search. Check your token permissions for the Search Box API.');
        return;
      }
      if (!response.ok) {
        throw new Error(`Search Box API retrieve failed with status ${response.status}`);
      }

      const data: {
        features?: Array<{ geometry?: { coordinates?: [number, number] } }>;
      } = await response.json();
      const center = data.features?.[0]?.geometry?.coordinates;
      if (!center || !Number.isFinite(center[0]) || !Number.isFinite(center[1])) {
        throw new Error('Search Box API returned no valid coordinates');
      }

      mapRef.current?.flyTo({
        center,
        zoom: suggestion.feature_type === 'poi' || suggestion.feature_type === 'address' ? 15 : 10,
        duration: 1500
      });
      setSearchQuery('');
      setSearchSuggestions([]);
      setActiveSuggestionIndex(-1);
      searchSessionTokenRef.current = createSearchSessionToken();
    } catch (error) {
      console.error('Could not retrieve the selected location:', error);
      setSearchError('Could not load that location. Please try another result.');
    } finally {
      setIsRetrievingSuggestion(false);
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
    <div className={`map-container map-canvas ${taskbarVisible ? '' : 'taskbar-hidden'}${isCreatePostMode ? ' create-post-mode' : ''}`}>
      {/* Location Search */}
      <div
        className={`map-geocoder expanded theme-${theme}`}
        ref={geocoderContainerRef}
        aria-label="Search for a location"
      >
        <div className="map-search-control">
          <MdSearch className="map-search-icon" aria-hidden="true" />
          <input
            className="map-search-input"
            type="search"
            role="combobox"
            aria-label="Search for a location in Canada"
            aria-autocomplete="list"
            aria-controls="map-search-suggestions"
            aria-activedescendant={activeSuggestionIndex >= 0 ? `map-search-suggestion-${activeSuggestionIndex}` : undefined}
            aria-expanded={searchSuggestions.length > 0}
            placeholder="Search locations, landmarks, or buildings"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchSuggestions([]);
              setSearchAttribution('');
              setSearchError(null);
              setActiveSuggestionIndex(-1);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' && searchSuggestions.length > 0) {
                event.preventDefault();
                setActiveSuggestionIndex((index) => Math.min(index + 1, searchSuggestions.length - 1));
              } else if (event.key === 'ArrowUp' && searchSuggestions.length > 0) {
                event.preventDefault();
                setActiveSuggestionIndex((index) => Math.max(index - 1, 0));
              } else if (event.key === 'Enter' && activeSuggestionIndex >= 0) {
                event.preventDefault();
                void selectSearchSuggestion(searchSuggestions[activeSuggestionIndex]);
              } else if (event.key === 'Escape') {
                setSearchSuggestions([]);
                setSearchError(null);
              }
            }}
          />
          {searchQuery && (
            <button
              className="map-search-clear"
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setSearchQuery('');
                setSearchError(null);
                focusGeocoderInput();
              }}
            >
              <MdClose aria-hidden="true" />
            </button>
          )}
        </div>
        {searchSuggestions.length > 0 && (
          <ul className="map-search-suggestions" id="map-search-suggestions" role="listbox">
            {searchSuggestions.map((suggestion, index) => (
              <li key={suggestion.mapbox_id} role="presentation">
                <button
                  className={`map-search-suggestion${index === activeSuggestionIndex ? ' active' : ''}`}
                  id={`map-search-suggestion-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeSuggestionIndex}
                  disabled={isRetrievingSuggestion}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void selectSearchSuggestion(suggestion)}
                >
                  <span className="map-search-suggestion-name">{suggestion.name}</span>
                  {suggestion.place_formatted && (
                    <span className="map-search-suggestion-context">{suggestion.place_formatted}</span>
                  )}
                </button>
              </li>
            ))}
            {searchAttribution && (
              <li className="map-search-attribution">{searchAttribution}</li>
            )}
          </ul>
        )}
        {(isSearchLoading || isRetrievingSuggestion || searchError ||
          (searchQuery.trim().length >= 2 && !isSearchLoading && searchSuggestions.length === 0)) && (
          <div className={`map-search-status${searchError ? ' error' : ''}`} role={searchError ? 'alert' : 'status'}>
            {searchError || (isRetrievingSuggestion ? 'Loading location…' : isSearchLoading ? 'Searching…' : 'No locations found.')}
          </div>
        )}
      </div>

      {/* My Location Button */}
      <button
        className={`location-button theme-${theme}`}
        onClick={() => {
          if (!window.isSecureContext) {
            showNotification('Location requires a secure (HTTPS) connection.', true);
            return;
          }
          if ("geolocation" in navigator) {
            const onSuccess = (position: GeolocationPosition) => {
              const { longitude, latitude } = position.coords;
              mapRef.current?.flyTo({
                center: [longitude, latitude],
                zoom: 12,
                duration: 2000
              });
            };
            const onError = (error: GeolocationPositionError) => {
                if (error.code === 1) { // PERMISSION_DENIED
                  showNotification('Location access denied. Please enable location permissions in your browser settings and refresh the page.', true);
                } else if (error.code === 2) { // POSITION_UNAVAILABLE
                  showNotification('Location unavailable. Please check your GPS/location services.', true);
                } else if (error.code === 3) { // TIMEOUT
                  showNotification('Location request timed out. Please try again.', true);
                } else {
                  showNotification('Unable to access location. Please enable location permissions.', true);
                }
            };
            // Retry with low accuracy if high accuracy fails (GPS off, indoors, timeout).
            navigator.geolocation.getCurrentPosition(
              onSuccess,
              (error) => {
                if (error.code === 1) {
                  onError(error);
                  return;
                }
                navigator.geolocation.getCurrentPosition(onSuccess, onError, {
                  enableHighAccuracy: false,
                  timeout: 15000,
                  maximumAge: 300000
                });
              },
              { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
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
                setIsPopupImageLoading(Boolean(post.content.image));
                const popupBounds = getPopupBounds(isMobileViewport);
                const nextPopupSize = { width: popupBounds.defaultW, height: popupBounds.defaultH };
                setPopupSize(nextPopupSize);
                cleanupResizeSession();

                // Center the story popup and pan so the marker sits under it.
                centerMapForPopup(post, nextPopupSize);
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
                    fill="rgba(255, 255, 255, 0.98)"
                    stroke="rgba(255, 255, 255, 0.95)"
                    strokeWidth="3.4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"
                    fill="rgba(255, 255, 255, 0.98)"
                    stroke="var(--marker-color)"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
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
              setIsPopupImageLoading(false);
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
                  <div className="map-popup-image-frame" aria-busy={isPopupImageLoading}>
                    {isPopupImageLoading && <span className="map-popup-image-loader" aria-label="Loading image" />}
                    <img
                      src={getPostImageUrl(popupInfo._id)}
                      alt={popupInfo.title}
                      className={`map-popup-image ${isPopupImageLoading ? 'loading' : ''}`}
                      onLoad={() => setIsPopupImageLoading(false)}
                      onError={() => setIsPopupImageLoading(false)}
                      onClick={() => {
                        setModalImageSrc(getPostImageUrl(popupInfo._id));
                        setModalImageAlt(popupInfo.title);
                        setIsImageModalOpen(true);
                      }}
                      style={{ cursor: 'pointer' }}
                      title="Click to view full size"
                    />
                  </div>
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
                style={{ display: isMobileViewport ? 'none' : 'block' }}
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