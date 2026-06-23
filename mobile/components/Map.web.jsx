import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapView = React.forwardRef((props, ref) => {
  return (
    <View style={[styles.container, props.style]}>
      <Text style={styles.title}>Map is not supported on Web</Text>
      <Text style={styles.subtitle}>Please use the mobile app to view the live command map.</Text>
    </View>
  );
});

export const Marker = () => null;
export const UrlTile = () => null;
export const PROVIDER_DEFAULT = null;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  }
});

export default MapView;
