import React, { useEffect, useMemo, useState } from 'react';
import './ImageModal.css';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageSrc, imageAlt }) => {
  if (!isOpen) return null;

  const [zoom, setZoom] = useState(1);

  const minZoom = 1;
  const maxZoom = 4;
  const zoomStep = 0.25;

  const zoomLabel = useMemo(() => `${Math.round(zoom * 100)}%`, [zoom]);

  useEffect(() => {
    if (isOpen) setZoom(1);
  }, [isOpen, imageSrc]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === '+' || e.key === '=') {
      setZoom((z) => Math.min(maxZoom, Number((z + zoomStep).toFixed(2))));
    }
    if (e.key === '-') {
      setZoom((z) => Math.max(minZoom, Number((z - zoomStep).toFixed(2))));
    }
    if (e.key === '0') {
      setZoom(1);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const direction = e.deltaY > 0 ? -1 : 1;
    setZoom((z) => {
      const next = z + direction * zoomStep;
      return Math.max(minZoom, Math.min(maxZoom, Number(next.toFixed(2))));
    });
  };

  return (
    <div 
      className="image-modal-overlay" 
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="image-modal-content">
        <div className="image-modal-toolbar" role="toolbar" aria-label="Image controls">
          <div className="image-modal-zoom" aria-label={`Zoom level: ${zoomLabel}`}>{zoomLabel}</div>
          <button
            className="image-modal-toolbtn"
            type="button"
            onClick={() => setZoom((z) => Math.max(minZoom, Number((z - zoomStep).toFixed(2))))}
            aria-label="Zoom out"
            title="Zoom out"
          >
            −
          </button>
          <button
            className="image-modal-toolbtn"
            type="button"
            onClick={() => setZoom(1)}
            aria-label="Reset zoom"
            title="Reset zoom"
          >
            1:1
          </button>
          <button
            className="image-modal-toolbtn"
            type="button"
            onClick={() => setZoom((z) => Math.min(maxZoom, Number((z + zoomStep).toFixed(2))))}
            aria-label="Zoom in"
            title="Zoom in"
          >
            +
          </button>
          <button className="image-modal-close" type="button" onClick={onClose} aria-label="Close" title="Close">
          ×
          </button>
        </div>

        <div className="image-modal-viewport" onWheel={handleWheel}>
          <img
            src={imageSrc}
            alt={imageAlt}
            className="image-modal-img"
            style={{ transform: `scale(${zoom})` }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;