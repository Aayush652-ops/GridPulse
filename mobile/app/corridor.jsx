import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Layout } from '../constants/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { eventsService } from '../services/events';
import MapView, { Marker } from '../components/Map';
import { Config } from '../constants/Config';
import { LinearGradient } from 'expo-linear-gradient';

export default function CorridorScreen() {
  // Steps: select_incident -> analyzing -> route_preview -> active_tracking
  const [step, setStep] = useState('select_incident'); 
  const [incidents, setIncidents] = useState([]);
  const [selectedInc, setSelectedInc] = useState(null);
  
  // Input fields for custom routing
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  
  // AI Metrics
  const [metrics, setMetrics] = useState({
    distance: '8.4 km',
    standardEta: '32 mins',
    optimizedEta: '14 mins',
    timeSaved: '18 mins',
    confidence: '96%',
    risk: 'Low',
    signalsModified: 9,
  });

  // Tracking Simulation State
  const [trackingData, setTrackingData] = useState({
    speed: 55,
    distanceRemaining: 8.4,
    etaRemaining: 14,
    progress: 0,
    status: 'EN_ROUTE',
  });

  // Alternative route toggle (Route A vs Route B)
  const [selectedRouteOption, setSelectedRouteOption] = useState('optimal');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const data = await eventsService.getActiveEvents();
      setIncidents(data);
      if (data.length > 0) {
        setSelectedInc(data[0]);
        setSource(data[0].location || 'Indiranagar Main Road');
        setDestination('Victoria Hospital');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectIncident = (inc) => {
    setSelectedInc(inc);
    setSource(inc.location || '');
    setDestination('Victoria Hospital');
  };

  const startAnalysis = () => {
    if (!source || !destination) return;
    setStep('analyzing');
    
    // Simulate AI routing calculation
    setTimeout(() => {
      setStep('route_preview');
    }, 2000);
  };

  const handleActivateCorridor = () => {
    setStep('active_tracking');
    setTrackingData({
      speed: 62,
      distanceRemaining: 8.4,
      etaRemaining: 14,
      progress: 0,
      status: 'EN_ROUTE',
    });
  };

  // Live tracking simulator
  useEffect(() => {
    let interval;
    if (step === 'active_tracking') {
      interval = setInterval(() => {
        setTrackingData(prev => {
          if (prev.distanceRemaining <= 0.2) {
            clearInterval(interval);
            return {
              speed: 0,
              distanceRemaining: 0,
              etaRemaining: 0,
              progress: 100,
              status: 'ARRIVED',
            };
          }
          const nextDist = Math.max(0, parseFloat((prev.distanceRemaining - 0.4).toFixed(1)));
          const nextEta = Math.max(0, Math.ceil((nextDist / 8.4) * 14));
          const nextProgress = Math.min(100, Math.round(((8.4 - nextDist) / 8.4) * 100));
          const currentSpeed = 55 + Math.floor(Math.random() * 15);

          return {
            speed: currentSpeed,
            distanceRemaining: nextDist,
            etaRemaining: nextEta,
            progress: nextProgress,
            status: 'EN_ROUTE',
          };
        });
      }, 3000); // Progress every 3s
    }
    return () => clearInterval(interval);
  }, [step]);

  // Leaflet coordinates mapping (Bengaluru Indiranagar to Victoria Hospital)
  const routePoints = {
    optimal: [
      [12.9716, 77.5946], // Bengaluru center
      [12.9650, 77.5900],
      [12.9600, 77.5850],
      [12.9573, 77.5729], // Victoria Hospital
    ],
    alternative: [
      [12.9716, 77.5946],
      [12.9750, 77.5800],
      [12.9680, 77.5750],
      [12.9573, 77.5729],
    ]
  };

  const routesForMap = [
    {
      points: routePoints.optimal,
      color: Colors.success,
      weight: 6,
    },
    {
      points: routePoints.alternative,
      color: Colors.primary,
      weight: 4,
      opacity: 0.5,
    }
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Green Corridor AI', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.textPrimary }} />
      <LinearGradient colors={Colors.gradientDark} style={StyleSheet.absoluteFillObject} />

      {step === 'select_incident' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card>
            <Text style={styles.cardTitle}>1. Target Selection</Text>
            
            <Text style={styles.label}>Select Active Emergency:</Text>
            <ScrollView style={styles.incidentList} nestedScrollEnabled>
              {incidents.map(inc => (
                <TouchableOpacity 
                  key={inc.id}
                  style={[styles.incidentSelectorItem, selectedInc?.id === inc.id && styles.incidentSelectorItemActive]}
                  onPress={() => handleSelectIncident(inc)}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.incType}>{inc.event_cause.replace('_', ' ').toUpperCase()}</Text>
                    <Badge text={inc.priority} color={inc.priority === 'HIGH' ? Colors.danger : Colors.warning} />
                  </View>
                  <Text style={styles.incLoc}>{inc.location}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.divider} />

            <Text style={styles.label}>Route Configuration:</Text>
            <View style={styles.inputGroup}>
              <Ionicons name="location-outline" size={20} color={Colors.success} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Source Location"
                placeholderTextColor={Colors.textMuted}
                value={source}
                onChangeText={setSource}
              />
            </View>

            <View style={styles.connector} />

            <View style={styles.inputGroup}>
              <Ionicons name="medical-outline" size={20} color={Colors.danger} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Destination Hospital"
                placeholderTextColor={Colors.textMuted}
                value={destination}
                onChangeText={setDestination}
              />
            </View>

            <TouchableOpacity 
              style={[styles.btn, (!source || !destination) && styles.btnDisabled]} 
              onPress={startAnalysis}
              disabled={!source || !destination}
            >
              <LinearGradient
                colors={Colors.gradientPrimary}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="git-network" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>Compute AI Optimal Corridor</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      )}

      {step === 'analyzing' && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.analysisText}>Analyzing Smart City Congestion...</Text>
          <Text style={styles.analysisSubtext}>Evaluating 14 signal intersections & traffic patterns</Text>
        </View>
      )}

      {step === 'route_preview' && (
        <View style={{ flex: 1 }}>
          {/* Map Preview */}
          <View style={styles.mapContainer}>
            <MapView
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                latitude: Config.BENGALURU.latitude,
                longitude: Config.BENGALURU.longitude,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              }}
              routes={routesForMap}
            >
              <Marker
                coordinate={{ latitude: 12.9716, longitude: 77.5946 }}
                title="Ambulance AMB-04"
                description="Source Point"
              />
              <Marker
                coordinate={{ latitude: 12.9573, longitude: 77.5729 }}
                title="Victoria Hospital"
                description="Destination Point"
              />
            </MapView>
          </View>

          {/* KPI bottom panel */}
          <View style={styles.bottomPreviewCard}>
            <Text style={styles.bottomCardTitle}>AI Green Corridor Route Preview</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.kpiBox}>
                <Text style={styles.kpiVal}>{metrics.standardEta}</Text>
                <Text style={styles.kpiLbl}>Standard ETA</Text>
              </View>
              <View style={styles.kpiBox}>
                <Text style={[styles.kpiVal, { color: Colors.success }]}>{metrics.optimizedEta}</Text>
                <Text style={styles.kpiLbl}>AI Optimized ETA</Text>
              </View>
              <View style={styles.kpiBox}>
                <Text style={[styles.kpiVal, { color: Colors.primary }]}>{metrics.timeSaved}</Text>
                <Text style={styles.kpiLbl}>Time Saved</Text>
              </View>
            </View>

            <View style={styles.kpiMetaRow}>
              <Text style={styles.metaLabel}>Signals Modified: <Text style={styles.metaVal}>{metrics.signalsModified}</Text></Text>
              <Text style={styles.metaLabel}>Confidence: <Text style={styles.metaVal}>{metrics.confidence}</Text></Text>
              <Text style={styles.metaLabel}>Risk Index: <Text style={styles.metaVal}>{metrics.risk}</Text></Text>
            </View>

            {/* Alternative routes toggle */}
            <View style={styles.routeSelector}>
              <TouchableOpacity 
                style={[styles.routeSelButton, selectedRouteOption === 'optimal' && styles.routeSelActive]}
                onPress={() => setSelectedRouteOption('optimal')}
              >
                <Text style={[styles.routeSelText, selectedRouteOption === 'optimal' && styles.routeSelTextActive]}>Optimal Route A (Green)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.routeSelButton, selectedRouteOption === 'alternative' && styles.routeSelActive]}
                onPress={() => setSelectedRouteOption('alternative')}
              >
                <Text style={[styles.routeSelText, selectedRouteOption === 'alternative' && styles.routeSelTextActive]}>Alternative Route B (Blue)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep('select_incident')}>
                <Text style={styles.cancelBtnText}>Recalculate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.activateBtn} onPress={handleActivateCorridor}>
                <Text style={styles.activateBtnText}>Approve & Activate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {step === 'active_tracking' && (
        <View style={{ flex: 1 }}>
          {/* Tracking Map */}
          <View style={styles.mapContainer}>
            <MapView
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                latitude: Config.BENGALURU.latitude,
                longitude: Config.BENGALURU.longitude,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              }}
              routes={[
                {
                  points: routePoints.optimal,
                  color: Colors.success,
                  weight: 6,
                }
              ]}
            >
              {/* Simulated moving vehicle */}
              <Marker
                coordinate={{ 
                  latitude: 12.9716 - (0.0143 * (trackingData.progress / 100)), 
                  longitude: 77.5946 - (0.0217 * (trackingData.progress / 100)) 
                }}
                title="Ambulance AMB-04"
                description="Live Positioning"
              />
              <Marker
                coordinate={{ latitude: 12.9573, longitude: 77.5729 }}
                title="Victoria Hospital"
              />
            </MapView>
          </View>

          {/* Uber style bottom card */}
          <View style={styles.bottomPreviewCard}>
            <View style={styles.trackingHeader}>
              <View>
                <Text style={styles.callsignTitle}>AMBULANCE AMB-04</Text>
                <Text style={styles.driverSub}>Driver: Ramesh Kumar • Mission GC-03</Text>
              </View>
              <Badge 
                text={trackingData.status.replace('_', ' ')} 
                color={trackingData.status === 'ARRIVED' ? Colors.success : Colors.danger} 
              />
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Mission Transit Progress</Text>
                <Text style={styles.progressPercent}>{trackingData.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressIndicator, { width: `${trackingData.progress}%` }]} />
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.kpiBox}>
                <Text style={styles.kpiVal}>{trackingData.speed} km/h</Text>
                <Text style={styles.kpiLbl}>Vehicle Speed</Text>
              </View>
              <View style={styles.kpiBox}>
                <Text style={styles.kpiVal}>{trackingData.distanceRemaining} km</Text>
                <Text style={styles.kpiLbl}>Distance Left</Text>
              </View>
              <View style={styles.kpiBox}>
                <Text style={[styles.kpiVal, { color: Colors.primary }]}>{trackingData.etaRemaining} mins</Text>
                <Text style={styles.kpiLbl}>Remaining ETA</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.abortMissionBtn} onPress={() => setStep('select_incident')}>
              <Text style={styles.abortBtnText}>Deactivate Corridor & Abort</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Layout.padding.screen,
    paddingBottom: 40,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  incidentList: {
    maxHeight: 180,
    marginBottom: 16,
  },
  incidentSelectorItem: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Layout.radius.md,
    padding: 12,
    marginBottom: 8,
  },
  incidentSelectorItemActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  incType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  incLoc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.radius.md,
    height: 52,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: 'Inter',
    height: '100%',
  },
  connector: {
    height: 16,
    width: 2,
    backgroundColor: Colors.border,
    marginLeft: 26,
  },
  btn: {
    height: 54,
    borderRadius: Layout.radius.md,
    marginTop: 20,
    overflow: 'hidden',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Inter',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  analysisText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    fontFamily: 'Inter',
  },
  analysisSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    fontFamily: 'Inter',
  },
  mapContainer: {
    flex: 1,
  },
  bottomPreviewCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  bottomCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  kpiBox: {
    flex: 1,
    alignItems: 'center',
  },
  kpiVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Inter',
  },
  kpiLbl: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
    fontFamily: 'Inter',
  },
  kpiMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 10,
    borderRadius: Layout.radius.md,
    marginBottom: 16,
  },
  metaLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: 'Inter',
  },
  metaVal: {
    color: '#fff',
    fontWeight: 'bold',
  },
  routeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  routeSelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  routeSelActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  routeSelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  routeSelTextActive: {
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  activateBtn: {
    flex: 2,
    height: 48,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activateBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  callsignTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  driverSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  abortMissionBtn: {
    height: 48,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  abortBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.danger,
  },
});
