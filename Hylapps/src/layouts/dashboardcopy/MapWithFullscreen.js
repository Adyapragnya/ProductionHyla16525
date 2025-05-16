import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-fullscreen';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const MapWithFullscreen = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let resizeTimeout;

    const defaultMinZoom = map.getMinZoom();
    const defaultMaxZoom = map.getMaxZoom();

    // Only ONE fullscreen control added manually
    const fullscreenControl = new L.Control.Fullscreen({
      position: 'topright',
      title: 'Enter Fullscreen',
      titleCancel: 'Exit Fullscreen',
      forceSeparateButton: true, // ensures it's standalone
    });
    fullscreenControl.addTo(map);

    const ResetViewControl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-bar');
        const button = L.DomUtil.create('a', 'leaflet-bar-part leaflet-reset-view', container);
        button.title = 'Reset View';
        button.href = '#';
        button.innerHTML = '<i class="fas fa-sync-alt"></i>';

        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, 'click', (e) => {
          L.DomEvent.preventDefault(e);
          map.invalidateSize();
          map.setMinZoom(defaultMinZoom);
          map.setMaxZoom(defaultMaxZoom);
          map.setView([0, 0], 4);
        });

        return container;
      },
    });

    const resetControl = new ResetViewControl();
    resetControl.addTo(map);

    const handleFullscreenChange = () => {
      setTimeout(() => {
        const isFullscreen =
          document.fullscreenElement ||
          map?.isFullscreen?.() ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement;

        if (isFullscreen) {
          map.setMinZoom(3);
          map.setMaxZoom(20);
          map.setView([0, 0], 3);
        } else {
          map.setMinZoom(defaultMinZoom);
          map.setMaxZoom(defaultMaxZoom);
          map.setView([0, 0], 4);
        }

        map.invalidateSize();
      }, 150);
    };

    const updateZoom = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        map.invalidateSize();
        map.setView([0, 0], 4);
      }, 100);
    };

    window.addEventListener('resize', updateZoom);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    map.on('fullscreenchange', handleFullscreenChange);

    return () => {
      fullscreenControl.remove();
      resetControl.remove();
      window.removeEventListener('resize', updateZoom);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      map.off('fullscreenchange', handleFullscreenChange);
      clearTimeout(resizeTimeout);
    };
  }, [map]);

  return null;
};

export default MapWithFullscreen;
