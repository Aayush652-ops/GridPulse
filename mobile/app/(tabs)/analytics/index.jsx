import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Colors } from '../../../constants/Colors';
import { Typography } from '../../../constants/Typography';
import { Layout } from '../../../constants/Layout';
import { Card } from '../../../components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;

export default function OperationalAnalyticsScreen() {
  const chartConfig = {
    backgroundColor: Colors.surface,
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
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
      <Stack.Screen options={{ title: 'Operational Analytics', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.textPrimary }} />
      <LinearGradient colors={Colors.gradientDark} style={StyleSheet.absoluteFillObject} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>8,432</Text>
            <Text style={styles.statLabel}>Total Incidents</Text>
            <Text style={styles.trendUp}>+12% vs last month</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>24m</Text>
            <Text style={styles.statLabel}>Avg Resolution</Text>
            <Text style={styles.trendDown}>-5m vs last month</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Weekly Incident Trend</Text>
        <Card style={styles.chartCard}>
          <LineChart
            data={incidentTrendData}
            width={screenWidth - Layout.padding.screen * 2 - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card>

        <Text style={styles.sectionTitle}>Avg Resolution Time (Mins)</Text>
        <Card style={styles.chartCard}>
          <BarChart
            data={resolutionTimeData}
            width={screenWidth - Layout.padding.screen * 2 - 32}
            height={220}
            yAxisLabel=""
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Success color
            }}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </Card>

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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statCard: {
    width: '48%',
    padding: 16,
  },
  statValue: {
    ...Typography.metricSmall,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  trendUp: {
    ...Typography.caption,
    color: Colors.danger,
  },
  trendDown: {
    ...Typography.caption,
    color: Colors.success,
  },
  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 16,
  },
  chartCard: {
    padding: 16,
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  }
});
