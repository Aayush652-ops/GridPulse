import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

const MapView = React.forwardRef((props, ref) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerGroupRef = useRef([]);

  useEffect(() => {
    // 1. Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // 2. Inject Leaflet JS
    const scriptId = 'leaflet-js';
    let script = document.getElementById(scriptId);

    const initMap = () => {
      if (!window.L || !mapContainerRef.current || mapInstanceRef.current) return;

      const { latitude, longitude } = props.initialRegion || { latitude: 12.9716, longitude: 77.5946 };

      // Initialize map
      const map = window.L.map(mapContainerRef.current).setView([latitude, longitude], 12);
      mapInstanceRef.current = map;

      // Use dark themed tiles
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Expose map reference if ref provided
      if (ref) {
        if (typeof ref === 'function') ref(map);
        else ref.current = map;
      }

      updateMarkers();
    };

    const updateMarkers = () => {
      const map = mapInstanceRef.current;
      if (!map || !window.L) return;

      // Clear old markers
      markerGroupRef.current.forEach(m => m.remove());
      markerGroupRef.current = [];

      const addMarker = (child) => {
        if (!child || !child.props) return;
        if (child.props.coordinate) {
          const { latitude, longitude } = child.props.coordinate;
          const title = child.props.title || 'Marker';
          const desc = child.props.description || '';

          const marker = window.L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(`<b>${title}</b><br/>${desc}`);
          markerGroupRef.current.push(marker);
        }
      };

      React.Children.forEach(props.children, child => {
        if (!child) return;
        if (Array.isArray(child)) {
          child.forEach(addMarker);
        } else {
          addMarker(child);
        }
      });
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.body.appendChild(script);
    } else if (window.L) {
      initMap();
    } else {
      script.addEventListener('load', initMap);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [props.initialRegion]);

  // Re-run marker update when children change
  useEffect(() => {
    if (mapInstanceRef.current && window.L) {
      // Clear old markers and redraw
      markerGroupRef.current.forEach(m => m.remove());
      markerGroupRef.current = [];

      const map = mapInstanceRef.current;
      const addMarker = (child) => {
        if (!child || !child.props) return;
        if (child.props.coordinate) {
          const { latitude, longitude } = child.props.coordinate;
          const title = child.props.title || 'Marker';
          const desc = child.props.description || '';

          const marker = window.L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(`<b>${title}</b><br/>${desc}`);
          markerGroupRef.current.push(marker);
        }
      };

      React.Children.forEach(props.children, child => {
        if (!child) return;
        if (Array.isArray(child)) {
          child.forEach(addMarker);
        } else {
          addMarker(child);
        }
      });
    }
  }, [props.children]);

  // Handle polyline drawing for routes
  useEffect(() => {
    if (mapInstanceRef.current && window.L) {
      // Clear old polylines
      if (!window.polylinesList) window.polylinesList = [];
      window.polylinesList.forEach(p => p.remove());
      window.polylinesList = [];

      if (props.routes && Array.isArray(props.routes)) {
        const map = mapInstanceRef.current;
        props.routes.forEach(r => {
          if (r.points && Array.isArray(r.points)) {
            const poly = window.L.polyline(r.points, {
              color: r.color || '#00D4FF',
              weight: r.weight || 5,
              opacity: r.opacity || 0.8
            }).addTo(map);
            window.polylinesList.push(poly);
          }
        });
      }
    }
  }, [props.routes]);

  return (
    <View style={[styles.container, props.style]}>
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
      />
    </View>
  );
});

export const Marker = React.forwardRef((props, ref) => {
  return null;
});

export const UrlTile = () => null;
export const PROVIDER_DEFAULT = null;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    flex: 1,
  }
});

export default MapView;
