import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';

// --- Patch Leaflet to prevent _leaflet_pos errors ---
const patchDomUtil = () => {
  const original = L.DomUtil.getPosition;
  L.DomUtil.getPosition = (el) => {
    try {
      return original(el);
    } catch {
      return L.point(0, 0);
    }
  };
};
patchDomUtil();

// --- Icon utilities ---
const getIconForZoom = (zoom) => {
  if (zoom > 23) return { width: 50, height: 120, type: 'extra-large' };
  if (zoom > 20) return { width: 60, height: 80, type: 'extra-large' };
  if (zoom > 17.75) return { width: 60, height: 120, type: 'large' };
  if (zoom > 16.75) return { width: 45, height: 120, type: 'large' };
  if (zoom > 16) return { width: 35, height: 120, type: 'large' };
  if (zoom > 15.75) return { width: 25, height: 70, type: 'large' };
  if (zoom > 14.75) return { width: 15, height: 40, type: 'large' };
  if (zoom > 13.75) return { width: 10, height: 35, type: 'large' };
  if (zoom > 12.75) return { width: 10, height: 35, type: 'large' };
  if (zoom > 11.5) return { width: 9, height: 25, type: 'large' };
  if (zoom > 10.75) return { width: 8, height: 15, type: 'large' };
  if (zoom > 9.75) return { width: 8, height: 15, type: 'large' };
  if (zoom > 8.75) return { width: 8, height: 14, type: 'large' };
  if (zoom > 7) return { width: 8, height: 8, type: 'large' };
  if (zoom > 6) return { width: 8, height: 8, type: 'large' };
  if (zoom > 4) return { width: 8, height: 8, type: 'point' };
  if (zoom > 2) return { width: 7, height: 7, type: 'point' };
  return { width: 6, height: 6, type: 'point' };
};

const createCustomIcon = (heading, width, height, type) => {
  const url = type === 'extra-large' ? '/BERTH-ICON.PNG' : '/ship-popup.png';
  const style = `transform: rotate(${heading}deg);
                     width: ${width}px;
                     height: ${height}px;`;
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="${style}"><img src="${url}" style="width:100%;height:100%"/></div>`,
    iconSize: [width, height],
  });
};

const createPointIcon = (size, color) =>
  L.divIcon({
    className: 'point-icon',
    html: `<div style="width:${size}px;height:${size}px;background-color:${color};border-radius:50%"></div>`,
    iconSize: [size, size],
  });

// --- Main component ---
const MapWithMarkers = ({ vessels, selectedVessel }) => {
  const map = useMap();
  const clusterRef = useRef(null);
  const markersRef = useRef({});
  const prevVesselsRef = useRef([]);
  const prevSelectedRef = useRef(null);

  // Invalidate size on mount & resize events
  useEffect(() => {
    if (!map) return;
    map.invalidateSize();
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    map.on('fullscreenchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      map.off('fullscreenchange', onResize);
    };
  }, [map]);

  // Initialize cluster group
  useEffect(() => {
    if (!map) return;
    const group = L.markerClusterGroup({ maxClusterRadius: 30 });
    clusterRef.current = group;
    map.addLayer(group);
    return () => map.removeLayer(group);
  }, [map]);

  // Add / update vessel markers
  useEffect(() => {
    if (!map || !clusterRef.current) return;
    // Simple deep-compare
    if (JSON.stringify(prevVesselsRef.current) === JSON.stringify(vessels)) return;

    clusterRef.current.clearLayers();
    markersRef.current = {};

    vessels.forEach((v) => {
      const { AIS, SpireTransportType } = v;
      const key = AIS.NAME || `${AIS.LATITUDE}-${AIS.LONGITUDE}`;
      if (markersRef.current[key]) return;

      const zoom = map.getZoom();
      const { w, h, type } = getIconForZoom(zoom);
      const color = v.pointerColor === '#80AF81' ? '#610C9F' : v.pointerColor || 'red';
      const icon = type === 'point'
        ? createPointIcon(w, color)
        : createCustomIcon(AIS.HEADING, w, h, type);

      const marker = L.marker([AIS.LATITUDE, AIS.LONGITUDE], { icon });
      const popup = `<div class="popup-container">
        <h3>${AIS.NAME || '—'} <small>${v.IMO || 'N/A'}</small></h3>
        <p>Type: ${SpireTransportType || '–'}</p>
        <p>Heading: ${AIS.HEADING || '–'}° | Speed: ${AIS.SPEED || '–'} kn</p>
        <p>Dest: ${AIS.DESTINATION || '–'}</p>
        <p>ETA: ${AIS.ETA || '–'}</p>
        <a href="/dashboard/${AIS.NAME}" class="view-more">View More →</a>
      </div>`;
      marker.bindPopup(popup);

      clusterRef.current.addLayer(marker);
      markersRef.current[key] = { marker, vessel: v };
    });

    prevVesselsRef.current = vessels;
  }, [map, vessels]);

  // Fly to & highlight selected vessel
  useEffect(() => {
    if (!map || !selectedVessel || prevSelectedRef.current === selectedVessel) return;
    const { AIS } = selectedVessel;
    const { w, h, type } = getIconForZoom(map.getZoom());
    const icon = createCustomIcon(AIS.HEADING, w, h, type);
    map.flyTo([AIS.LATITUDE, AIS.LONGITUDE], 8, { animate: true, duration: 1 });

    // Ensure popup stays open
    const temp = L.marker([AIS.LATITUDE, AIS.LONGITUDE], { icon })
      .addTo(map)
      .bindPopup(`
        <strong>${AIS.NAME}</strong><br/>
        Speed: ${AIS.SPEED || '–'} kn<br/>
        Heading: ${AIS.HEADING || '–'}°
      `)
      .openPopup();

    temp.on('popupclose', () => temp.openPopup());
    prevSelectedRef.current = selectedVessel;

    return () => {
      map.removeLayer(temp);
    };
  }, [map, selectedVessel]);

  // Update icons on zoom changes
  const updateIcons = useCallback(() => {
    if (!map) return;
    const zoom = map.getZoom();
    const { w, h, type } = getIconForZoom(zoom);

    Object.values(markersRef.current).forEach(({ marker, vessel }) => {
      const { AIS } = vessel;
      const isSelected = selectedVessel && AIS.NAME === selectedVessel.AIS.NAME;
      const color = vessel.pointerColor === '#80AF81' ? '#610C9F' : vessel.pointerColor || 'red';
      const icon = isSelected
        ? createCustomIcon(AIS.HEADING, w, h, type)
        : (type === 'point' ? createPointIcon(w, color) : createCustomIcon(AIS.HEADING, w, h, type));

      marker.setIcon(icon);
      if (isSelected) marker.openPopup();
    });
  }, [map, selectedVessel]);

  useEffect(() => {
    if (!map) return;
    map.on('zoomend', updateIcons);
    return () => {
      map.off('zoomend', updateIcons);
    };
  }, [map, updateIcons]);

  return null;
};

MapWithMarkers.propTypes = {
  vessels: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedVessel: PropTypes.object,
};

export default MapWithMarkers;
