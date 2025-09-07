// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, Alert, Image, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { login, loading, error } = useAuth();
  const [username, setUsername] = useState('dem1');
  const [password, setPassword] = useState('1234');

  const onSubmit = async () => {
    try {
      await login(username.trim(), password);
      // navigation par rôle gérée ailleurs (RootNavigator)
    } catch {
      Alert.alert('Erreur', error ?? 'Échec de connexion');
    }
  };

  return (
    <View style={styles.root}>
      {/* En-tête illustré */}
      <LinearGradient colors={['#EEF3FF', '#FFFFFF']} style={styles.header}>
        <Image
          source={require('../../../assets/illustrations/login.png')}
          resizeMode="contain"
          style={styles.illustration}
        />
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Enter valid user name & password to continue</Text>
      </LinearGradient>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={18} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            placeholder="User name"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color="#fff" />
          </View>
        ) : (
          <Pressable onPress={onSubmit} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
            <LinearGradient colors={['#2F80ED', '#1C60D6']} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.cta}>
              <Text style={styles.ctaText}>Login</Text>
            </LinearGradient>
          </Pressable>
        )}

        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F8FF' },

  header: {
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 12,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  illustration: { width: 180, height: 140, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#1F2A44', marginTop: 4 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 6, textAlign: 'center' },

  form: { paddingHorizontal: 20, paddingTop: 18, gap: 14 },

  inputWrapper: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  inputIcon: { position: 'absolute', left: 14, top: 16 },
  input: {
    height: 48,
    paddingLeft: 42,
    paddingRight: 42,
    fontSize: 15,
    color: '#111827',
  },

  cta: {
    marginTop: 10,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2F80ED',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  loader: {
    marginTop: 10,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F80ED',
  },

  error: { color: '#DC2626', textAlign: 'center', marginTop: 10, fontWeight: '600' },
});
