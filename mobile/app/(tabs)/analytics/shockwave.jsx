import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { Typography } from '../../../constants/Typography';
import { Layout } from '../../../constants/Layout';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { eventsService } from '../../../services/events';
import { LinearGradient } from 'expo-linear-gradient';

export default function ShockwaveScreen() {
  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      // Normally we would call eventsService.getForecastPropagation(...)
      // We simulate the response here
      await new Promise(r => setTimeout(r, 2000));
      
      setSimulationResult({
        primaryNode: 'Silk Board Junction',
        propagationTime: '45 mins',
        affectedRadius: '3.5 km',
        severityPeak: 'Critical',
        secondaryHotspots: ['Madiwala', 'BTM Layout', 'HSR Layout'],
        recommendation: 'Deploy immediate traffic diversion at Madiwala checkpost to prevent gridlock.'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Shockwave Simulator', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.textPrimary }} />
      <LinearGradient colors={Colors.gradientDark} style={StyleSheet.absoluteFillObject} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="git-merge" size={24} color={Colors.warning} />
            <Text style={styles.infoTitle}>Predictive Cascade</Text>
          </View>
          <Text style={styles.infoText}>
            Simulate how traffic incidents propagate through the city grid over time to preemptively deploy resources.
          </Text>
          
          <TouchableOpacity 
            style={styles.btn} 
            onPress={runSimulation}
            disabled={loading}
          >
            <LinearGradient
              colors={Colors.gradientDanger}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="play" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.btnText}>Run Silk Board Simulation</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Card>

        {simulationResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.sectionTitle}>Simulation Results</Text>
            
            <Card>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>{simulationResult.primaryNode}</Text>
                <Badge text={simulationResult.severityPeak} color={Colors.danger} />
              </View>

              <View style={styles.dataGrid}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Propagation</Text>
                  <Text style={styles.dataValue}>{simulationResult.propagationTime}</Text>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Impact Radius</Text>
                  <Text style={styles.dataValue}>{simulationResult.affectedRadius}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.subTitle}>Secondary Hotspots</Text>
              <View style={styles.tagsContainer}>
                {simulationResult.secondaryHotspots.map(spot => (
                  <View key={spot} style={styles.tag}>
                    <Text style={styles.tagText}>{spot}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.divider} />

              <View style={styles.recommendationBox}>
                <Ionicons name="bulb" size={20} color={Colors.warning} style={{ marginRight: 8 }} />
                <Text style={styles.recommendationText}>{simulationResult.recommendation}</Text>
              </View>
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
  scrollContent: {
    padding: Layout.padding.screen,
    paddingBottom: 40,
  },
  infoCard: {
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  infoText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  btn: {
    height: 56,
    borderRadius: Layout.radius.md,
    overflow: 'hidden',
  },
  btnGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    ...Typography.bodyBold,
    color: '#fff',
  },
  resultContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  dataGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dataItem: {
    flex: 1,
  },
  dataLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dataValue: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 16,
  },
  subTitle: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Layout.radius.sm,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  recommendationBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  recommendationText: {
    ...Typography.body,
    color: Colors.warning,
    flex: 1,
  }
});
