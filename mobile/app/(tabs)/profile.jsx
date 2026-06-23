import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Layout } from '../../constants/Layout';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { user, role, logout } = useAuth();

  return (
    <View style={styles.container}>
      <LinearGradient colors={Colors.gradientDark} style={StyleSheet.absoluteFillObject} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.profileCard} variant="glass">
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.username}>{user?.username || 'Operator'}</Text>
          <Text style={styles.role}>{role?.replace('_', ' ').toUpperCase()}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
            <Text style={styles.infoText}>Account Status: Active</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>Assigned Zone: Bengaluru Central</Text>
          </View>
        </Card>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.textPrimary} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: 'rgba(5, 11, 24, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.headline,
    color: Colors.textPrimary,
  },
  content: {
    padding: Layout.padding.screen,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  username: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  role: {
    ...Typography.captionBold,
    color: Colors.primary,
    marginBottom: 24,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  infoText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: Colors.danger,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    ...Typography.button,
    color: Colors.textPrimary,
  },
});
