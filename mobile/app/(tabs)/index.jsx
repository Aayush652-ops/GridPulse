import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { Colors, getSeverityColor, getPriorityColor } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Layout } from '../../constants/Layout';
import { Config } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CityHealthScore } from '../../components/CityHealthScore';
import { QuickActions } from '../../components/QuickActions';
import { eventsService } from '../../services/events';
import { generateWeatherData } from '../../data/weatherEngine';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [data, setData] = useState({
    activeIncidents: 0,
    criticalIncidents: 0,
    severityBreakdown: { high: 0, medium: 0, low: 0 },
    weatherScore: 100,
    healthScore: 100,
    readiness: 96,
    emergencyStatus: 'STABLE',
    subscores: { traffic: 100, emergency: 100, weather: 100, infrastructure: 95, resources: 92 },
    predictionConfidence: 94,
  });

  const loadDashboardData = useCallback(async () => {
    try {
      const activeEvents = await eventsService.getActiveEvents();
      setIncidents(activeEvents.slice(0, 3));
      const weather = generateWeatherData();

      let critical = 0;
      let breakdown = { high: 0, medium: 0, low: 0 };
      
      activeEvents.forEach(e => {
        if (e.priority?.toLowerCase() === 'high' || e.severity_score >= 75) {
          critical++;
          breakdown.high++;
        } else if (e.priority?.toLowerCase() === 'medium' || e.severity_score >= 40) {
          breakdown.medium++;
        } else {
          breakdown.low++;
        }
      });

      const trafficScore = Math.max(0, 100 - (activeEvents.length * 2) - (critical * 5));
      const weatherScore = 100 - weather.weatherSeverity;
      const emergencyScore = 95;
      const infraScore = 91;
      const resourceScore = 89;
      const healthScore = Math.round((trafficScore * 0.4) + (weatherScore * 0.15) + (emergencyScore * 0.2) + (infraScore * 0.15) + (resourceScore * 0.1));

      setData({
        activeIncidents: activeEvents.length,
        criticalIncidents: critical,
        severityBreakdown: breakdown,
        weatherScore: Math.round(weatherScore),
        healthScore,
        readiness: critical > 0 ? 88 : 96,
        emergencyStatus: critical > 1 ? 'ALERT' : 'STABLE',
        subscores: {
          traffic: Math.round(trafficScore),
          emergency: emergencyScore,
          weather: Math.round(weatherScore),
          infrastructure: infraScore,
          resources: resourceScore,
        },
        predictionConfidence: 95,
      });

    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, Config.POLLING.EVENTS);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getRoleTailoredWidget = () => {
    const role = user?.role || 'operator';
    switch (role.toLowerCase()) {
      case 'administrator':
        return (
          <Card style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
              <Text style={styles.roleCardTitle}>Admin Intelligence Panel</Text>
            </View>
            <Text style={styles.roleCardText}>All emergency response lanes and sensor feeds are operational. No manual overrides active.</Text>
          </Card>
        );
      case 'traffic_controller':
        return (
          <Card style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <Ionicons name="car" size={20} color={Colors.warning} />
              <Text style={styles.roleCardTitle}>Traffic Corridor Status</Text>
            </View>
            <Text style={styles.roleCardText}>High congestion predicted on Outer Ring Road. Suggest scheduling signal adjustments.</Text>
          </Card>
        );
      case 'police_officer':
        return (
          <Card style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <Ionicons name="shield" size={20} color={Colors.info} />
              <Text style={styles.roleCardTitle}>Patrol Dispatch Feed</Text>
            </View>
            <Text style={styles.roleCardText}>3 patrol vehicles on standby near Indiranagar. Signal override available for emergencies.</Text>
          </Card>
        );
      case 'ambulance_driver':
        return (
          <Card style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <Ionicons name="medkit" size={20} color={Colors.danger} />
              <Text style={styles.roleCardTitle}>Ambulance Navigation Desk</Text>
            </View>
            <Text style={styles.roleCardText}>Hospital capacities are stable. Tap "Command Map" to view green routing zones.</Text>
          </Card>
        );
      case 'fire_officer':
        return (
          <Card style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <Ionicons name="flame" size={20} color={Colors.warning} />
              <Text style={styles.roleCardTitle}>Fire Crew Dispatch Panel</Text>
            </View>
            <Text style={styles.roleCardText}>All fire tenders are refueled. Standby status in Central Station: active.</Text>
          </Card>
        );
      default:
        return (
          <Card style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <Ionicons name="alert-circle" size={20} color={Colors.primary} />
              <Text style={styles.roleCardTitle}>Operator Action Desk</Text>
            </View>
            <Text style={styles.roleCardText}>Select "Generate Corridor" to route emergency vehicles through congestion points.</Text>
          </Card>
        );
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <View style={StyleSheet.absoluteFillObject}>
          <video
            src={require('../../assets/background.mp4')}
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.2,
            }}
          />
          <LinearGradient
            colors={['rgba(5, 10, 25, 0.85)', 'rgba(5, 10, 25, 0.98)']}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      ) : (
        <LinearGradient colors={Colors.gradientDark} style={StyleSheet.absoluteFillObject} />
      )}
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Command Center</Text>
          <Text style={styles.userRole}>
            {user?.username} • {user?.role ? user.role.replace('_', ' ').toUpperCase() : 'OPERATOR'}
          </Text>
        </View>
        <TouchableOpacity style={styles.bellButton} onPress={() => setShowNotifications(!showNotifications)}>
          <Ionicons name="notifications" size={24} color={showNotifications ? Colors.primary : '#fff'} />
          <View style={styles.badgeCount} />
        </TouchableOpacity>
      </View>

      {showNotifications && (
        <View style={styles.notificationOverlay}>
          <Card style={styles.notificationCard}>
            <View style={styles.notifHeader}>
              <Text style={styles.notifTitle}>Alert Center</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.notifList}>
              <View style={styles.notifItem}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} style={{ marginRight: 8 }} />
                <Text style={styles.notifText}>Emergency Corridor Activated for Ambulance AMB-04</Text>
              </View>
              <View style={styles.notifItem}>
                <Ionicons name="warning" size={16} color={Colors.warning} style={{ marginRight: 8 }} />
                <Text style={styles.notifText}>Water Logging Alert: Silk Board junction speed reduced</Text>
              </View>
              <View style={styles.notifItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} style={{ marginRight: 8 }} />
                <Text style={styles.notifText}>Mission Completed: GC-9201 deactivated successfully</Text>
              </View>
            </ScrollView>
          </Card>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Text style={styles.sectionTitle}>City Health Index</Text>
        <Card variant="glass">
          <CityHealthScore score={data.healthScore} subscores={data.subscores} />
        </Card>

        {/* Secondary Widgets Row */}
        <View style={styles.secondaryRow}>
          <Card style={styles.secCard}>
            <Text style={styles.secVal}>{data.readiness}%</Text>
            <Text style={styles.secLbl}>Readiness</Text>
          </Card>
          <Card style={styles.secCard}>
            <Text style={[styles.secVal, { color: data.emergencyStatus === 'ALERT' ? Colors.danger : Colors.success }]}>
              {data.emergencyStatus}
            </Text>
            <Text style={styles.secLbl}>Emergency Status</Text>
          </Card>
          <Card style={styles.secCard}>
            <Text style={styles.secVal}>{data.predictionConfidence}%</Text>
            <Text style={styles.secLbl}>AI Confidence</Text>
          </Card>
        </View>

        {/* Role Custom Widget */}
        {getRoleTailoredWidget()}

        <Text style={styles.sectionTitle}>Quick Operations</Text>
        <QuickActions />

        <Text style={styles.sectionTitle}>Live Emergency Incidents</Text>
        <View style={styles.incidentFeed}>
          {incidents.length === 0 ? (
            <Text style={styles.emptyFeedText}>No active emergencies registered</Text>
          ) : (
            incidents.map(inc => {
              const color = getSeverityColor(inc.severity_score);
              return (
                <Card key={inc.id} style={styles.feedCard}>
                  <View style={styles.feedCardHeader}>
                    <Text style={styles.feedCardTitle}>{inc.event_cause.replace('_', ' ').toUpperCase()}</Text>
                    <Badge text={inc.priority || 'MEDIUM'} color={getPriorityColor(inc.priority)} />
                  </View>
                  <Text style={styles.feedCardLoc}>{inc.location || 'Bengaluru Center'}</Text>
                  <View style={styles.feedCardFooter}>
                    <Text style={styles.feedCardSeverity}>Severity: {inc.severity_score}%</Text>
                    <Text style={styles.feedCardTime}>{inc.id}</Text>
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Layout.statusBarHeight + 20,
    paddingHorizontal: Layout.padding.screen,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  greeting: {
    ...Typography.headline,
    color: Colors.textPrimary,
  },
  userRole: {
    ...Typography.captionBold,
    color: Colors.primary,
    marginTop: 4,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
  },
  badgeCount: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  scrollContent: {
    padding: Layout.padding.screen,
    paddingBottom: 100,
  },
  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 20,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  secCard: {
    width: '31%',
    padding: 12,
    alignItems: 'center',
    marginBottom: 0,
    backgroundColor: Colors.surface,
  },
  secVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    fontFamily: 'Inter',
  },
  secLbl: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  roleCard: {
    marginTop: 16,
    backgroundColor: 'rgba(13, 23, 40, 0.8)',
    borderColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1,
    padding: 16,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  roleCardText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  incidentFeed: {
    marginTop: 4,
  },
  emptyFeedText: {
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  feedCard: {
    marginBottom: 12,
    backgroundColor: Colors.surface,
    padding: 16,
  },
  feedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  feedCardLoc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginVertical: 6,
  },
  feedCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  feedCardSeverity: {
    fontSize: 12,
    color: Colors.warning,
  },
  feedCardTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  notificationOverlay: {
    position: 'absolute',
    top: Layout.statusBarHeight + 70,
    left: 20,
    right: 20,
    zIndex: 99,
  },
  notificationCard: {
    backgroundColor: Colors.surfaceElevated,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 8,
    marginBottom: 8,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  notifList: {
    maxHeight: 180,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  notifText: {
    fontSize: 12,
    color: Colors.textPrimary,
    flex: 1,
  },
});
