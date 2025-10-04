import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in Vite/webpack
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const containerStyle = { width: '100%', height: '100%' };
const initialCenter = { lat: -3.745, lng: -38.523 };

const LiveTracking = () => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapEl = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    // init map once
    mapRef.current = L.map(mapEl.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: 15,
      zoomControl: true,
      attributionControl: true,
    });

    // OSM tiles (free, no key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    // initial marker
    markerRef.current = L.marker([initialCenter.lat, initialCenter.lng]).addTo(mapRef.current);

    // optional: live geolocation tracking
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          markerRef.current.setLatLng([latitude, longitude]);
          // pan only if marker is off screen to reduce jank
          if (!mapRef.current.getBounds().contains([latitude, longitude])) {
            mapRef.current.panTo([latitude, longitude], { animate: true, duration: 0.4 });
          }
        },
        /* onError */ () => {},
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      mapRef.current?.remove();
    };
  }, []);

  return <div ref={mapEl} style={containerStyle} />;
};

export default LiveTracking;
