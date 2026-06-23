import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Layout } from '../constants/Layout';
import { Config } from '../constants/Config';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('operator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(username, password, role);
      } else {
        await login(username, password, role);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="grid" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.title}>{Config.APP_NAME}</Text>
          <Text style={styles.subtitle}>{Config.APP_TAGLINE}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isRegister ? 'Create Account' : 'Welcome Back'}</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={Colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {isRegister && (
            <>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <Text style={styles.label}>Select Role</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleContainer}>
                {Config.ROLES.map((r) => (
                  <TouchableOpacity
                    key={r.key}
                    style={[styles.roleChip, role === r.key && styles.roleChipActive]}
                    onPress={() => setRole(r.key)}
                  >
                    <Ionicons 
                      name={r.icon} 
                      size={16} 
                      color={role === r.key ? Colors.textPrimary : Colors.textSecondary} 
                    />
                    <Text style={[styles.roleText, role === r.key && styles.roleTextActive]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleAuth}
            disabled={loading}
          >
            <LinearGradient
              colors={Colors.gradientPrimary}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={Colors.textPrimary} />
              ) : (
                <Text style={styles.buttonText}>{isRegister ? 'Register' : 'Login'}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toggleButton} 
            onPress={() => setIsRegister(!isRegister)}
          >
            <Text style={styles.toggleText}>
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Layout.padding.screen,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.2)',
  },
  title: {
    ...Typography.hero,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.glassBg,
    borderRadius: Layout.radius.xl,
    padding: Layout.padding.card * 1.5,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    height: '100%',
  },
  label: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.radius.round,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  roleChipActive: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    borderColor: Colors.primary,
  },
  roleText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  roleTextActive: {
    color: Colors.primary,
  },
  button: {
    marginTop: 8,
    height: 56,
    borderRadius: Layout.radius.md,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  toggleButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  toggleText: {
    ...Typography.body,
    color: Colors.primary,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    marginBottom: 16,
    textAlign: 'center',
  },
});
