import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

export function CityHealthScore({ score = 0, subscores = {} }) {
  const radius = 60;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = Colors.success;
  if (score < 50) color = Colors.danger;
  else if (score < 80) color = Colors.warning;

  // Defaults for subscores
  const scores = {
    traffic: subscores.traffic ?? 85,
    weather: subscores.weather ?? 90,
    emergency: subscores.emergency ?? 95,
    infrastructure: subscores.infrastructure ?? 88,
    resources: subscores.resources ?? 92,
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg height="160" width="160" viewBox="0 0 160 160">
          <G rotation="-90" origin="80, 80">
            <Circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#1E293B"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Circle
              cx="80"
              cy="80"
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        <View style={styles.scoreOverlay}>
          <Text style={[styles.scoreText, { color }]}>{score}</Text>
          <Text style={styles.scoreLabel}>Health KPI</Text>
        </View>
      </View>
      
      <View style={styles.subscoresContainer}>
        <SubScoreProgress label="Traffic" value={scores.traffic} />
        <SubScoreProgress label="Weather" value={scores.weather} />
        <SubScoreProgress label="Emergency Readiness" value={scores.emergency} />
        <SubScoreProgress label="Infrastructure" value={scores.infrastructure} />
        <SubScoreProgress label="Resources" value={scores.resources} />
      </View>
    </View>
  );
}

function SubScoreProgress({ label, value = 0 }) {
  let color = Colors.success;
  if (value < 50) color = Colors.danger;
  else if (value < 80) color = Colors.warning;

  return (
    <View style={styles.subscoreItem}>
      <View style={styles.subscoreHeader}>
        <Text style={styles.subscoreLabel}>{label}</Text>
        <Text style={[styles.subscoreValue, { color }]}>{value}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  chartContainer: {
    position: 'relative',
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  scoreLabel: {
    ...Typography.overline,
    color: Colors.textSecondary,
    marginTop: 2,
    letterSpacing: 1.5,
  },
  subscoresContainer: {
    flex: 1,
    marginLeft: 24,
    justifyContent: 'center',
  },
  subscoreItem: {
    marginBottom: 8,
  },
  subscoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subscoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    fontFamily: 'Inter',
  },
  subscoreValue: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  track: {
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 2,
  },
});
