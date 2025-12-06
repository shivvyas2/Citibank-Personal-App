import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import CitiLogo from '@/components/citi-logo';

export default function LoginScreen() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [enableSnapshot, setEnableSnapshot] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!userId.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both User ID and Password');
      return;
    }

    setIsLoading(true);
    try {
      // Use userId as email for login
      await login(userId.trim(), password);
      console.log('✅ Login successful');
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0066CC" translucent={false} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          
          {/* FDIC Information Banner */}
          <View style={styles.fdicContainer}>
            <View style={styles.fdicRow}>
              <Text style={styles.fdicText}>FDIC</Text>
              <Text style={styles.fdicDescription}>
                FDIC-Insured - Backed by the full faith and credit of the U.S. Government
              </Text>
            </View>
            <Text style={styles.citibankName}>Citibank, N.A.</Text>
          </View>

          {/* Citi Logo */}
          <View style={styles.logoContainer}>
            <CitiLogo size={48} color="white" />
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>User ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your User ID"
                placeholderTextColor="#999"
                value={userId}
                onChangeText={setUserId}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.showButton}>
                  <Text style={styles.showButtonText}>Show</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Enable Snapshot Checkbox */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setEnableSnapshot(!enableSnapshot)}>
                {enableSnapshot && (
                  <IconSymbol name="checkmark" size={16} color="#0066CC" />
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Enable Snapshot</Text>
              <TouchableOpacity style={styles.helpButton}>
                <IconSymbol name="questionmark.circle" size={18} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Sign On Button */}
            <TouchableOpacity
              style={[styles.signOnButton, isLoading && styles.signOnButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#0066CC" />
              ) : (
                <Text style={styles.signOnButtonText}>Sign On</Text>
              )}
            </TouchableOpacity>

            {/* Forgot Links */}
            <View style={styles.forgotContainer}>
              <TouchableOpacity>
                <Text style={styles.forgotLink}>Forgot User ID</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotLink}>Forgot Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.bottomNavItem}>
            <IconSymbol name="mappin.circle" size={24} color="white" />
            <Text style={styles.bottomNavText}>Find ATM</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavItem}>
            <IconSymbol name="qrcode" size={24} color="white" />
            <Text style={styles.bottomNavText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavItem}>
            <IconSymbol name="questionmark.circle" size={24} color="white" />
            <Text style={styles.bottomNavText}>Support</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0066CC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  fdicContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    marginBottom: 40,
  },
  fdicRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  fdicText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0066CC',
    marginRight: 8,
    minWidth: 40,
  },
  fdicDescription: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  citibankName: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    marginTop: 4,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    marginTop: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#E6F4FE',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#B3D9F2',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4FE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B3D9F2',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },
  showButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  showButtonText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxLabel: {
    fontSize: 14,
    color: 'white',
    flex: 1,
  },
  helpButton: {
    padding: 4,
  },
  signOnButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signOnButtonDisabled: {
    opacity: 0.6,
  },
  signOnButtonText: {
    color: '#0066CC',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  forgotLink: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  bottomNavText: {
    fontSize: 12,
    color: 'white',
    marginTop: 4,
    fontWeight: '500',
  },
});

