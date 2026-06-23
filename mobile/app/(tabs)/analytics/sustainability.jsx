import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { Typography } from '../../../constants/Typography';
import { Layout } from '../../../constants/Layout';
import { Card } from '../../../components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;

export default function SustainabilityScreen() {
  const chartConfig = {
    backgroundColor: Colors.surface,
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const emissionsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [120, 115, 108, 105, 95, 88], // tons of CO2
        color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
      },
    ],
  };

  const progressData = {
    labels: ['CO2 Reduction', 'Fuel Saved', 'EV Usage'], // optional
    data: [0.6, 0.45, 0.8],
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Sustainability', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.textPrimary }} />
      <LinearGradient colors={Colors.gradientDark} style={StyleSheet.absoluteFillObject} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.heroCardContainer}>
          <LinearGradient
            colors={[Colors.surface, 'rgba(16, 185, 129, 0.1)']}
            style={styles.heroCard}
          >
            <View style={styles.heroHeader}>
              <Ionicons name="leaf" size={32} color={Colors.success} />
              <View style={styles.heroTextContainer}>
                <Text style={styles.heroTitle}>Eco Score</Text>
                <Text style={styles.heroSubtitle}>City-wide sustainability</Text>
              </View>
              <Text style={styles.ecoScore}>84</Text>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Carbon Emissions Trend (Tons)</Text>
        <Card style={styles.chartCard}>
          <LineChart
            data={emissionsData}
            width={screenWidth - Layout.padding.screen * 2 - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card>

        <Text style={styles.sectionTitle}>Key Goals Progress</Text>
        <Card style={styles.chartCard}>
          <ProgressChart
            data={progressData}
            width={screenWidth - Layout.padding.screen * 2 - 32}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1, index) => {
                const colors = [
                  `rgba(16, 185, 129, ${opacity})`,
                  `rgba(14, 165, 233, ${opacity})`,
                  `rgba(245, 158, 11, ${opacity})`,
                ];
                return colors[index % colors.length] || `rgba(255, 255, 255, ${opacity})`;
              }
            }}
            hideLegend={false}
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
  heroCardContainer: {
    marginBottom: 20,
    borderRadius: Layout.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroCard: {
    padding: 24,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  heroTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  heroSubtitle: {
    ...Typography.caption,
    color: Colors.success,
  },
  ecoScore: {
    ...Typography.metric,
    color: Colors.success,
  },
  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginTop: 8,
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
