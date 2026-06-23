import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Colors } from '../../../constants/Colors';
import { Typography } from '../../../constants/Typography';
import { Layout } from '../../../constants/Layout';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;

export default function OperationalAnalyticsScreen() {
  const [activeTab, setActiveTab] = useState('impact'); // impact | intelligence | weather

  const chartConfig = {
    backgroundColor: Colors.surface,
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 212, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
  };

  const incidentTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50],
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Danger color
      },
    ],
  };

  const resolutionTimeData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [45, 42, 38, 35, 30, 25],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Analytics Center', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.textPrimary }} />
      <LinearGradient colors={Colors.gradientDark} style={StyleSheet.absoluteFillObject} />

      <View style={styles.tabsRow}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'impact' && styles.activeTabButton]} 
          onPress={() => setActiveTab('impact')}
        >
          <Text style={[styles.tabText, activeTab === 'impact' && styles.activeTabText]}>Impact & KPIs</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'intelligence' && styles.activeTabButton]} 
          onPress={() => setActiveTab('intelligence')}
        >
          <Text style={[styles.tabText, activeTab === 'intelligence' && styles.activeTabText]}>Traffic Intelligence</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'weather' && styles.activeTabButton]} 
          onPress={() => setActiveTab('weather')}
        >
          <Text style={[styles.tabText, activeTab === 'weather' && styles.activeTabText]}>Weather Desk</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {activeTab === 'impact' && (
          <View>
            {/* Impact Grid */}
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Ionicons name="people" size={20} color={Colors.primary} style={{ marginBottom: 6 }} />
                <Text style={styles.statValue}>430+</Text>
                <Text style={styles.statLabel}>Lives Impacted</Text>
                <Text style={styles.trendUp}>+24% Response</Text>
              </Card>
              <Card style={styles.statCard}>
                <Ionicons name="leaf" size={20} color={Colors.success} style={{ marginBottom: 6 }} />
                <Text style={styles.statValue}>890 kg</Text>
                <Text style={styles.statLabel}>CO2 Reduction</Text>
                <Text style={styles.trendDown}>340L Fuel Saved</Text>
              </Card>
            </View>

            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Ionicons name="flash" size={20} color={Colors.warning} style={{ marginBottom: 6 }} />
                <Text style={styles.statValue}>14</Text>
                <Text style={styles.statLabel}>Corridors Activated</Text>
                <Text style={styles.trendUp}>18m avg time saved</Text>
              </Card>
              <Card style={styles.statCard}>
                <Ionicons name="analytics" size={20} color={Colors.primary} style={{ marginBottom: 6 }} />
                <Text style={styles.statValue}>95.4%</Text>
                <Text style={styles.statLabel}>AI Accuracy</Text>
                <Text style={styles.trendUp}>500+ daily checks</Text>
              </Card>
            </View>

            <Text style={styles.sectionTitle}>Weekly Incidents Resolution Trend</Text>
            <Card style={styles.chartCard}>
              <LineChart
                data={incidentTrendData}
                width={screenWidth - Layout.padding.screen * 2 - 32}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </Card>
          </View>
        )}

        {activeTab === 'intelligence' && (
          <View>
            <Text style={styles.sectionTitle}>Congestion & Hotspots</Text>
            
            <Card style={styles.infoBlockCard}>
              <View style={styles.blockHeader}>
                <Ionicons name="flame" size={20} color={Colors.danger} />
                <Text style={styles.blockTitle}>High-Risk Hotspots (Live)</Text>
              </View>
              <View style={styles.hotspotItem}>
                <Text style={styles.hotspotName}>1. Silk Board Junction</Text>
                <Badge text="CRITICAL RISK" color={Colors.danger} />
              </View>
              <View style={styles.hotspotItem}>
                <Text style={styles.hotspotName}>2. Outer Ring Road (Marathahalli)</Text>
                <Badge text="EMERGING RISK" color={Colors.warning} />
              </View>
              <View style={styles.hotspotItem}>
                <Text style={styles.hotspotName}>3. Koramangala 80 Feet Road</Text>
                <Badge text="MODERATE" color={Colors.success} />
              </View>
            </Card>

            <Text style={styles.sectionTitle}>Predicted Peak Congestion Zones</Text>
            <Card style={styles.infoBlockCard}>
              <Text style={styles.predictionText}>
                AI predicts peak traffic congestion between **05:30 PM & 07:45 PM** on Outer Ring Road. Recommend routing emergency fleets via Domlur flyover bypass.
              </Text>
              <View style={styles.trafficIndexRow}>
                <View style={styles.indexBox}>
                  <Text style={styles.indexValue}>84%</Text>
                  <Text style={styles.indexLabel}>Current Load</Text>
                </View>
                <View style={styles.indexBox}>
                  <Text style={[styles.indexValue, { color: Colors.danger }]}>92%</Text>
                  <Text style={styles.indexLabel}>Peak Forecast</Text>
                </View>
                <View style={styles.indexBox}>
                  <Text style={[styles.indexValue, { color: Colors.success }]}>22m</Text>
                  <Text style={styles.indexLabel}>Bypass Savings</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {activeTab === 'weather' && (
          <View>
            <Text style={styles.sectionTitle}>Weather Desk Overview</Text>
            
            <Card style={styles.weatherCard}>
              <View style={styles.weatherHeader}>
                <View>
                  <Text style={styles.weatherCondition}>Monsoon Overcast</Text>
                  <Text style={styles.weatherLoc}>Bengaluru Center</Text>
                </View>
                <Ionicons name="rainy" size={40} color={Colors.primary} />
              </View>
              
              <View style={styles.weatherStatsRow}>
                <View style={styles.weatherKpi}>
                  <Text style={styles.weatherVal}>65%</Text>
                  <Text style={styles.weatherLbl}>Rain / Flood Risk</Text>
                </View>
                <View style={styles.weatherKpi}>
                  <Text style={styles.weatherVal}>4.2 km</Text>
                  <Text style={styles.weatherLbl}>Visibility Index</Text>
                </View>
                <View style={styles.weatherKpi}>
                  <Text style={[styles.weatherVal, { color: Colors.warning }]}>Heavy</Text>
                  <Text style={styles.weatherLbl}>Traffic Impact</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.infoBlockCard}>
              <View style={styles.blockHeader}>
                <Ionicons name="warning" size={20} color={Colors.warning} />
                <Text style={styles.blockTitle}>Flood-Prone Alerts</Text>
              </View>
              <Text style={styles.predictionText}>
                Drainage sensors near Bellandur lake report levels at **84% capacity**. Precipitation forecasts indicate a high likelihood of surface pooling within the next 45 minutes.
              </Text>
            </Card>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    fontSize: 12,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    marginBottom: 0,
    backgroundColor: Colors.surface,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'Inter',
    marginBottom: 6,
  },
  trendUp: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.success,
    fontFamily: 'Inter',
  },
  trendDown: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: 'Inter',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    fontFamily: 'Inter',
    marginTop: 20,
    marginBottom: 12,
  },
  chartCard: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  infoBlockCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    marginBottom: 12,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
    fontFamily: 'Inter',
  },
  hotspotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  hotspotName: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontFamily: 'Inter',
  },
  predictionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    fontFamily: 'Inter',
  },
  trafficIndexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 12,
    borderRadius: Layout.radius.md,
  },
  indexBox: {
    alignItems: 'center',
    flex: 1,
  },
  indexValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Inter',
  },
  indexLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
    fontFamily: 'Inter',
  },
  weatherCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    marginBottom: 12,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherCondition: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Inter',
  },
  weatherLoc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    fontFamily: 'Inter',
  },
  weatherStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 14,
  },
  weatherKpi: {
    flex: 1,
    alignItems: 'center',
  },
  weatherVal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Inter',
  },
  weatherLbl: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 4,
    fontFamily: 'Inter',
  },
});
