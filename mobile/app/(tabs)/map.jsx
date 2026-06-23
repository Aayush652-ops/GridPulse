import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from '../../components/Map';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getSeverityColor } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Layout } from '../../constants/Layout';
import { Config } from '../../constants/Config';
import { eventsService } from '../../services/events';
import { bengaluruHospitals } from '../../data/bengaluruHospitals';
import { bengaluruPoliceStations, bengaluruFireStations } from '../../data/bengaluruStations';
import { generateVehicleFleet } from '../../data/emergencyVehicles';

export default function MapScreen() {
  const mapRef = useRef(null);
  const [incidents, setIncidents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [layers, setLayers] = useState({
    incidents: true,
    hospitals: false,
    police: false,
    fire: false,
    vehicles: true,
  });

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMapData = async () => {
    try {
      const data = await eventsService.getActiveEvents();
      setIncidents(data);
      setVehicles(generateVehicleFleet());
    } catch (e) {
      console.error('Failed to fetch map data', e);
    }
  };

  const toggleLayer = (layer) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const renderIncidentMarkers = () => {
    if (!layers.incidents) return null;
    return incidents.map(incident => {
      // Need some fallback coordinates if not provided by backend exactly
      // but in GridPulse they should be there, if not we add jitter
      const lat = incident.latitude || (Config.BENGALURU.latitude + (Math.random() - 0.5) * 0.1);
      const lng = incident.longitude || (Config.BENGALURU.longitude + (Math.random() - 0.5) * 0.1);
      
      const color = getSeverityColor(incident.severity_score);
      
      return (
        <Marker
          key={`inc-${incident.id}`}
          coordinate={{ latitude: lat, longitude: lng }}
          title={incident.event_cause}
          description={`Severity: ${incident.severity_score}%`}
        >
          <View style={[styles.markerRing, { borderColor: color, backgroundColor: `${color}40` }]}>
            <View style={[styles.markerDot, { backgroundColor: color }]} />
          </View>
        </Marker>
      );
    });
  };

  const renderHospitalMarkers = () => {
    if (!layers.hospitals) return null;
    return bengaluruHospitals.map(h => (
      <Marker
        key={h.id}
        coordinate={{ latitude: h.latitude, longitude: h.longitude }}
        title={h.name}
        description={`Capacity: ${h.emergencyCapacity}%`}
      >
        <View style={[styles.facilityMarker, { backgroundColor: Colors.success }]}>
          <Ionicons name="medical" size={14} color="#fff" />
        </View>
      </Marker>
    ));
  };

  const renderStationMarkers = () => {
    const markers = [];
    if (layers.police) {
      bengaluruPoliceStations.forEach(s => {
        markers.push(
          <Marker key={s.id} coordinate={{ latitude: s.latitude, longitude: s.longitude }} title={s.name}>
            <View style={[styles.facilityMarker, { backgroundColor: Colors.info }]}>
              <Ionicons name="shield" size={14} color="#fff" />
            </View>
          </Marker>
        );
      });
    }
    if (layers.fire) {
      bengaluruFireStations.forEach(s => {
        markers.push(
          <Marker key={s.id} coordinate={{ latitude: s.latitude, longitude: s.longitude }} title={s.name}>
            <View style={[styles.facilityMarker, { backgroundColor: Colors.warning }]}>
              <Ionicons name="flame" size={14} color="#fff" />
            </View>
          </Marker>
        );
      });
    }
    return markers;
  };

  const renderVehicleMarkers = () => {
    if (!layers.vehicles) return null;
    return vehicles.map(v => {
      const typeConfig = Config.VEHICLE_TYPES.find(t => t.key === v.type) || Config.VEHICLE_TYPES[0];
      return (
        <Marker
          key={v.id}
          coordinate={{ latitude: v.latitude, longitude: v.longitude }}
          title={v.callsign}
          description={v.status.replace('_', ' ').toUpperCase()}
        >
          <View style={[styles.vehicleMarker, { borderColor: typeConfig.color }]}>
            <Ionicons name={typeConfig.icon} size={12} color={typeConfig.color} />
          </View>
        </Marker>
      );
    });
  };

  // Construct MapTiler URL
  const maptilerUrl = `https://api.maptiler.com/maps/dataviz-dark/256/{z}/{x}/{y}.png?key=${Config.MAPTILER_KEY}`;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_DEFAULT : undefined}
        initialRegion={{
          latitude: Config.BENGALURU.latitude,
          longitude: Config.BENGALURU.longitude,
          latitudeDelta: Config.Layout?.map?.defaultLatitudeDelta || 0.15,
          longitudeDelta: Config.Layout?.map?.defaultLongitudeDelta || 0.15,
        }}
        mapType="none" // Use none to hide default base map if UrlTile covers it
      >
        <UrlTile
          urlTemplate={maptilerUrl}
          maximumZ={19}
          flipY={false}
        />
        
        {renderIncidentMarkers()}
        {renderHospitalMarkers()}
        {renderStationMarkers()}
        {renderVehicleMarkers()}
      </MapView>

      <View style={styles.headerControls}>
        <Text style={styles.screenTitle}>Command Map</Text>
      </View>

      <View style={styles.floatingControls}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.layersScroll}>
          <LayerToggle 
            icon="warning" 
            label="Incidents" 
            active={layers.incidents} 
            color={Colors.danger}
            onPress={() => toggleLayer('incidents')} 
          />
          <LayerToggle 
            icon="car" 
            label="Fleet" 
            active={layers.vehicles} 
            color={Colors.primary}
            onPress={() => toggleLayer('vehicles')} 
          />
          <LayerToggle 
            icon="medical" 
            label="Hospitals" 
            active={layers.hospitals} 
            color={Colors.success}
            onPress={() => toggleLayer('hospitals')} 
          />
          <LayerToggle 
            icon="shield" 
            label="Police" 
            active={layers.police} 
            color={Colors.info}
            onPress={() => toggleLayer('police')} 
          />
          <LayerToggle 
            icon="flame" 
            label="Fire" 
            active={layers.fire} 
            color={Colors.warning}
            onPress={() => toggleLayer('fire')} 
          />
        </ScrollView>
      </View>

      <TouchableOpacity 
        style={styles.recenterButton}
        onPress={() => {
          mapRef.current?.animateToRegion({
            latitude: Config.BENGALURU.latitude,
            longitude: Config.BENGALURU.longitude,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          });
        }}
      >
        <Ionicons name="locate" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

function LayerToggle({ icon, label, active, color, onPress }) {
  return (
    <TouchableOpacity 
      style={[styles.layerToggle, active && { borderColor: color, backgroundColor: `${color}20` }]} 
      onPress={onPress}
    >
      <Ionicons name={icon} size={16} color={active ? color : Colors.textSecondary} style={{ marginRight: 6 }} />
      <Text style={[styles.layerLabel, active && { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerControls: {
    position: 'absolute',
    top: Layout.statusBarHeight + 10,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: 12,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  screenTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  floatingControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  layersScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  layerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Layout.radius.round,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  layerLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  recenterButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  markerRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  facilityMarker: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  vehicleMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
