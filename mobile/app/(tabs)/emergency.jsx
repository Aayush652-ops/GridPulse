import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, Dimensions } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Layout } from '../../constants/Layout';
import { Config } from '../../constants/Config';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { generateVehicleFleet } from '../../data/emergencyVehicles';
const emergencyNodes = require('../../assets/emergency_nodes.json');

const bengaluruHospitals = emergencyNodes.filter(n => n.type === 'hospital' || n.type === 'trauma_center').map(n => ({
  id: n.id,
  name: n.name,
  latitude: n.lat,
  longitude: n.lng,
  specialization: n.type === 'trauma_center' ? 'Trauma Center' : 'General Hospital',
  emergencyCapacity: Math.floor(60 + Math.random() * 35),
  address: `${n.zone}, Bengaluru`,
  trauma: n.type === 'trauma_center',
}));

const bengaluruPoliceStations = emergencyNodes.filter(n => n.type === 'police_station').map(n => ({
  id: n.id,
  name: n.name,
  latitude: n.lat,
  longitude: n.lng,
  address: `${n.zone}, Bengaluru`,
}));

const bengaluruFireStations = emergencyNodes.filter(n => n.type === 'fire_station').map(n => ({
  id: n.id,
  name: n.name,
  latitude: n.lat,
  longitude: n.lng,
  address: `${n.zone}, Bengaluru`,
}));

import { eventsService } from '../../services/events';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function EmergencyScreen() {
  const [activeTab, setActiveTab] = useState('fleet'); // fleet | facilities | ai_rec
  const [vehicles, setVehicles] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [incidents, setIncidents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modals state
  const [briefingModalVisible, setBriefingModalVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  // Hospital AI Recommendation state
  const [selectedIncidentForAI, setSelectedIncidentForAI] = useState(null);
  const [rankedHospitals, setRankedHospitals] = useState([]);

  const fetchData = async () => {
    try {
      const fleet = generateVehicleFleet();
      fleet.sort((a, b) => {
        const rank = { en_route: 0, on_scene: 1, returning: 2, idle: 3 };
        return rank[a.status] - rank[b.status];
      });
      setVehicles(fleet);
      setActiveCount(fleet.filter(v => v.status !== 'idle').length);

      const activeEvents = await eventsService.getActiveEvents();
      setIncidents(activeEvents);
      if (activeEvents.length > 0 && !selectedIncidentForAI) {
        setSelectedIncidentForAI(activeEvents[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedIncidentForAI) {
      calculateHospitalRecommendations(selectedIncidentForAI);
    }
  }, [selectedIncidentForAI]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Hospital Recommendation AI Engine
  const calculateHospitalRecommendations = (incident) => {
    // Rank hospitals based on capacity, distance (simulated), trauma care, risk
    const ranked = bengaluruHospitals.map(h => {
      // Simulate distance based on lat/lng differences
      const incidentLat = incident.latitude || Config.BENGALURU.latitude;
      const incidentLng = incident.longitude || Config.BENGALURU.longitude;
      const distance = parseFloat((Math.sqrt(Math.pow(h.latitude - incidentLat, 2) + Math.pow(h.longitude - incidentLng, 2)) * 100).toFixed(1));
      
      // Calculate capacity score (emergencyCapacity)
      const capacityScore = 100 - h.emergencyCapacity; // More free beds (lower capacity) is better
      
      // Compute composite suitability score (higher is better)
      let suitability = 100 - (distance * 4) + (capacityScore * 0.3);
      if (h.trauma) suitability += 15; // Extra points for trauma support
      if (h.specialization.toLowerCase().includes('government')) suitability += 5; // Access friendliness

      suitability = Math.max(0, Math.min(100, Math.round(suitability)));

      return {
        ...h,
        distance,
        suitability,
        trafficRisk: distance > 8 ? 'High' : distance > 4 ? 'Medium' : 'Low',
      };
    });

    // Sort by suitability descending
    ranked.sort((a, b) => b.suitability - a.suitability);
    setRankedHospitals(ranked.slice(0, 3));
  };

  const handleOpenBriefing = (inc) => {
    setSelectedIncident(inc);
    setBriefingModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={Colors.gradientDark} style={StyleSheet.absoluteFillObject} />
      
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Response & Dispatch</Text>
        <Text style={styles.subtitle}>{activeCount} Response Vehicles Active</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'fleet' && styles.activeTabButton]} 
          onPress={() => setActiveTab('fleet')}
        >
          <Text style={[styles.tabText, activeTab === 'fleet' && styles.activeTabText]}>Active Fleet</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'facilities' && styles.activeTabButton]} 
          onPress={() => setActiveTab('facilities')}
        >
          <Text style={[styles.tabText, activeTab === 'facilities' && styles.activeTabText]}>Facilities</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'ai_rec' && styles.activeTabButton]} 
          onPress={() => setActiveTab('ai_rec')}
        >
          <Text style={[styles.tabText, activeTab === 'ai_rec' && styles.activeTabText]}>Hospital AI</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {activeTab === 'fleet' && (
          <>
            {/* Active emergencies triggering briefing */}
            <Text style={styles.sectionTitle}>Active Emergencies</Text>
            {incidents.slice(0, 2).map(inc => (
              <Card key={inc.id} style={styles.emergencyItemCard}>
                <View style={styles.emergencyHeader}>
                  <View style={styles.emergencyTitleGroup}>
                    <Ionicons name="alert-circle" size={20} color={Colors.danger} style={{ marginRight: 8 }} />
                    <Text style={styles.emergencyTitle}>{inc.event_cause.replace('_', ' ').toUpperCase()}</Text>
                  </View>
                  <Badge text="DISPATCH REQUIRED" color={Colors.danger} />
                </View>
                <Text style={styles.emergencyLoc}>{inc.location || 'Bengaluru Center'}</Text>
                
                <TouchableOpacity style={styles.briefingButton} onPress={() => handleOpenBriefing(inc)}>
                  <Ionicons name="document-text-outline" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.briefingButtonText}>One-Click AI Situation Briefing</Text>
                </TouchableOpacity>
              </Card>
            ))}

            <Text style={styles.sectionTitle}>Emergency Vehicles</Text>
            {vehicles.map(v => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </>
        )}

        {activeTab === 'facilities' && (
          <View>
            <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
            {bengaluruHospitals.slice(0, 3).map(h => (
              <Card key={h.id} style={styles.facilityCard}>
                <View style={styles.facilityHeader}>
                  <Text style={styles.facilityName}>{h.name}</Text>
                  <Badge text={`${h.emergencyCapacity}% Occupied`} color={h.emergencyCapacity > 85 ? Colors.danger : Colors.success} />
                </View>
                <Text style={styles.facilityText}>{h.specialization} • {h.address}</Text>
              </Card>
            ))}

            <Text style={styles.sectionTitle}>Nearby Police & Fire Stations</Text>
            {bengaluruPoliceStations.slice(0, 2).map(s => (
              <Card key={s.id} style={styles.facilityCard}>
                <View style={styles.facilityHeader}>
                  <Text style={styles.facilityName}>{s.name} (Police)</Text>
                  <Badge text="ONLINE" color={Colors.success} />
                </View>
                <Text style={styles.facilityText}>{s.address}</Text>
              </Card>
            ))}
            {bengaluruFireStations.slice(0, 2).map(s => (
              <Card key={s.id} style={styles.facilityCard}>
                <View style={styles.facilityHeader}>
                  <Text style={styles.facilityName}>{s.name} (Fire Station)</Text>
                  <Badge text="ON STANDBY" color={Colors.warning} />
                </View>
                <Text style={styles.facilityText}>{s.address}</Text>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'ai_rec' && (
          <View>
            <Text style={styles.sectionTitle}>Select Active Incident</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.incidentSelector}>
              {incidents.map(inc => (
                <TouchableOpacity 
                  key={inc.id}
                  style={[styles.selectorChip, selectedIncidentForAI?.id === inc.id && styles.selectorChipActive]}
                  onPress={() => setSelectedIncidentForAI(inc)}
                >
                  <Text style={[styles.selectorText, selectedIncidentForAI?.id === inc.id && styles.selectorTextActive]}>
                    {inc.event_cause.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Hospital Suitability Recommendations</Text>
            {rankedHospitals.map((h, idx) => (
              <Card key={h.id} style={[styles.recCard, idx === 0 && styles.recCardBest]}>
                {idx === 0 && (
                  <View style={styles.bestBadge}>
                    <Ionicons name="sparkles" size={14} color="#050B18" style={{ marginRight: 4 }} />
                    <Text style={styles.bestBadgeText}>RECOMMENDED CHOICE</Text>
                  </View>
                )}
                <View style={styles.facilityHeader}>
                  <View>
                    <Text style={styles.facilityName}>{h.name}</Text>
                    <Text style={styles.facilityText}>{h.address} • {h.distance} km away</Text>
                  </View>
                  <Text style={[styles.suitabilityScore, { color: idx === 0 ? Colors.primary : Colors.success }]}>
                    {h.suitability}% Suitability
                  </Text>
                </View>
                
                <View style={styles.recDetails}>
                  <View style={styles.recItem}>
                    <Ionicons name="speedometer" size={14} color={Colors.textSecondary} />
                    <Text style={styles.recText}>Traffic Congestion Risk: <Text style={{fontWeight: 'bold'}}>{h.trafficRisk}</Text></Text>
                  </View>
                  <View style={styles.recItem}>
                    <Ionicons name="bed" size={14} color={Colors.textSecondary} />
                    <Text style={styles.recText}>Beds Availability: <Text style={{fontWeight: 'bold'}}>{100 - h.emergencyCapacity}% available</Text></Text>
                  </View>
                  <View style={styles.recItem}>
                    <Ionicons name="medical" size={14} color={Colors.textSecondary} />
                    <Text style={styles.recText}>Trauma Facilities: <Text style={{fontWeight: 'bold'}}>{h.trauma ? 'Yes (Specialist)' : 'Standard'}</Text></Text>
                  </View>
                </View>

                <View style={styles.reasoningBox}>
                  <Text style={styles.reasoningTitle}>AI Suite Reasoning:</Text>
                  <Text style={styles.reasoningText}>
                    {idx === 0 
                      ? `${h.name} is ranked top choice due to optimal bed availability and low forecasted route congestion. Trauma facilities are active and pre-alerted.`
                      : `Alternative choice with a suitability of ${h.suitability}%. Highly accessible via primary highways but slightly longer response times.`}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Briefing Modal */}
      {briefingModalVisible && selectedIncident && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="shield" size={24} color={Colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>AI Situation Briefing</Text>
              </View>
              <TouchableOpacity onPress={() => setBriefingModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.briefingHeaderCard}>
                <Text style={styles.briefingIncidentType}>
                  {selectedIncident.event_cause.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={styles.briefingLoc}>{selectedIncident.location || 'Bengaluru Center'}</Text>
                <Badge text={`SEVERITY: ${selectedIncident.severity_score}%`} color={Colors.danger} style={{ marginTop: 8, alignSelf: 'flex-start' }} />
              </View>

              <Text style={styles.briefingSectionTitle}>Incident Summary</Text>
              <Card style={styles.briefingCard}>
                <Text style={styles.briefingText}>
                  Major multi-vehicle collision near {selectedIncident.location || 'Bengaluru Center'} causing extreme traffic gridlock. Immediate lane clearing needed for rescue operations.
                </Text>
              </Card>

              <Text style={styles.briefingSectionTitle}>Risk Summary</Text>
              <Card style={styles.briefingCard}>
                <Text style={styles.briefingText}>
                  Critical delays predicted for fire service dispatch. Grid congestion risk is HIGH with secondary intersection blocks emerging.
                </Text>
              </Card>

              <Text style={styles.briefingSectionTitle}>Actionable Response Plan</Text>
              <Card style={styles.briefingCard}>
                <Text style={styles.briefingText}>
                  1. Command signal overrides at adjacent intersections.{"\n"}
                  2. Deploy patrol vehicles to redirect local traffic flow.{"\n"}
                  3. Activate Green Corridor GC-03 for incoming trauma response.
                </Text>
              </Card>

              <Text style={styles.briefingSectionTitle}>Hospital Recommendation</Text>
              <Card style={styles.briefingCard}>
                <Text style={styles.briefingText}>
                  Victoria Hospital (85% Capacity, 1.2km, Low Risk) has been recommended due to emergency cardiac capacity and rapid accessibility via corridor lanes.
                </Text>
              </Card>

              <Text style={styles.briefingSectionTitle}>Expected Outcome</Text>
              <Card style={styles.briefingCard}>
                <Text style={styles.briefingText}>
                  Deployment of routing corrections is projected to reduce response transit times by 14 minutes and restore city health scores within 30 minutes.
                </Text>
              </Card>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

function VehicleCard({ vehicle }) {
  const typeConfig = Config.VEHICLE_TYPES.find(t => t.key === vehicle.type) || Config.VEHICLE_TYPES[0];
  
  let statusColor = Colors.textSecondary;
  let statusText = 'Idle';
  if (vehicle.status === 'en_route') { statusColor = Colors.danger; statusText = 'En Route'; }
  else if (vehicle.status === 'on_scene') { statusColor = Colors.warning; statusText = 'On Scene'; }
  else if (vehicle.status === 'returning') { statusColor = Colors.success; statusText = 'Returning'; }

  return (
    <Card style={styles.vehicleCard}>
      <View style={styles.vHeader}>
        <View style={styles.vTitleRow}>
          <View style={[styles.vIconBox, { backgroundColor: `${typeConfig.color}20` }]}>
            <Ionicons name={typeConfig.icon} size={18} color={typeConfig.color} />
          </View>
          <View>
            <Text style={styles.callsign}>{vehicle.callsign}</Text>
            <Text style={styles.vDriver}>{vehicle.driver}</Text>
          </View>
        </View>
        <Badge text={statusText} color={statusColor} />
      </View>

      <View style={styles.vBody}>
        {vehicle.mission && (
          <View style={styles.vRow}>
            <Ionicons name="flag" size={16} color={Colors.textSecondary} />
            <Text style={styles.vText}>Mission: {vehicle.mission}</Text>
          </View>
        )}
        
        <View style={styles.vRowGroup}>
          <View style={styles.vRow}>
            <Ionicons name="speedometer" size={16} color={Colors.textSecondary} />
            <Text style={styles.vText}>{vehicle.speed} km/h</Text>
          </View>
          {vehicle.eta && (
            <View style={styles.vRow}>
              <Ionicons name="time" size={16} color={Colors.textSecondary} />
              <Text style={styles.vText}>ETA: {vehicle.eta}m</Text>
            </View>
          )}
          <View style={styles.vRow}>
            <Ionicons name="battery-half" size={16} color={Colors.textSecondary} />
            <Text style={styles.vText}>{vehicle.fuelLevel}% Fuel</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenHeader: {
    paddingTop: Layout.statusBarHeight + 20,
    paddingHorizontal: Layout.padding.screen,
    paddingBottom: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  screenTitle: {
    ...Typography.headline,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.primary,
    marginTop: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13, 23, 40, 0.8)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    fontFamily: 'Inter',
  },
  activeTabText: {
    color: Colors.primary,
  },
  scrollContent: {
    padding: Layout.padding.screen,
    paddingBottom: 100,
  },
  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginBottom: 16,
    marginTop: 20,
  },
  emergencyItemCard: {
    marginBottom: 12,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emergencyTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    fontFamily: 'Inter',
  },
  emergencyLoc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 14,
  },
  briefingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: Layout.radius.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  briefingButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    fontFamily: 'Inter',
  },
  vehicleCard: {
    marginBottom: 12,
  },
  vHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  callsign: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
  },
  vDriver: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  vBody: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  vRowGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  vRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  facilityCard: {
    marginBottom: 12,
    backgroundColor: Colors.surface,
  },
  facilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  facilityName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  facilityText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  incidentSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  selectorChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Layout.radius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  selectorChipActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderColor: Colors.primary,
  },
  selectorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  selectorTextActive: {
    color: Colors.primary,
  },
  recCard: {
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recCardBest: {
    borderColor: 'rgba(0, 212, 255, 0.4)',
    backgroundColor: 'rgba(13, 23, 40, 0.9)',
    borderWidth: 2,
  },
  bestBadge: {
    position: 'absolute',
    top: -12,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Layout.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bestBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#050B18',
  },
  suitabilityScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  recDetails: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 10,
  },
  recItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  recText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  reasoningBox: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 10,
    borderRadius: Layout.radius.sm,
  },
  reasoningTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 2,
  },
  reasoningText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: Dimensions.get('window').height * 0.8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalBody: {
    padding: 20,
  },
  briefingHeaderCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: Layout.radius.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  briefingIncidentType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  briefingLoc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  briefingSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  briefingCard: {
    backgroundColor: Colors.surface,
    padding: 12,
    marginBottom: 8,
  },
  briefingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
