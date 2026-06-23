import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

export function CityHealthScore({ score = 0, subscores = {} }) {
  const radius = 60;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = Colors.success;
  if (score < 50) color = Colors.danger;
  else if (score < 80) color = Colors.warning;

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg height="160" width="160" viewBox="0 0 160 160">
          <G rotation="-90" origin="80, 80">
            <Circle
              cx="80"
              cy="80"
              r={radius}
              stroke={Colors.border}
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
          <Text style={styles.scoreLabel}>Health</Text>
        </View>
      </View>
      
      <View style={styles.subscoresContainer}>
        <SubScore label="Traffic" value={subscores.traffic} />
        <SubScore label="Emergency" value={subscores.emergency} />
        <SubScore label="Weather" value={subscores.weather} />
      </View>
    </View>
  );
}

function SubScore({ label, value = 0 }) {
  let color = Colors.success;
  if (value < 50) color = Colors.danger;
  else if (value < 80) color = Colors.warning;

  return (
    <View style={styles.subscoreItem}>
      <Text style={styles.subscoreLabel}>{label}</Text>
      <Text style={[styles.subscoreValue, { color }]}>{value}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    ...Typography.metric,
  },
  scoreLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  subscoresContainer: {
    flex: 1,
    marginLeft: 16,
  },
  subscoreItem: {
    marginBottom: 12,
  },
  subscoreLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  subscoreValue: {
    ...Typography.bodyBold,
  }
});
