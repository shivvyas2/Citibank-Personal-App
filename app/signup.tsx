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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
// CLERK CODE COMMENTED OUT - Using internal API only
// import { useSignUp } from '@clerk/clerk-expo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupScreen() {
  const router = useRouter();
  // CLERK CODE COMMENTED OUT
  // const { signUp, setActive, isLoaded } = useSignUp();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // CLERK CODE COMMENTED OUT
  // const [pendingVerification, setPendingVerification] = useState(false);
  // const [code, setCode] = useState('');

  // CLERK CODE COMMENTED OUT - Signup flow
  // const handleSignup = async () => {
  //   if (!isLoaded) return;
  //
  //   if (!email.trim() || !password.trim()) {
  //     Alert.alert('Error', 'Please enter both email and password');
  //     return;
  //   }
  //
  //   if (password.length < 8) {
  //     Alert.alert('Error', 'Password must be at least 8 characters long');
  //     return;
  //   }
  //
  //   setIsLoading(true);
  //   try {
  //     await signUp.create({
  //       emailAddress: email.trim(),
  //       password,
  //     });
  //
  //     await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
  //     setPendingVerification(true);
  //   } catch (error: any) {
  //     Alert.alert('Signup Failed', error.errors?.[0]?.message || 'An error occurred during signup');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  //
  // const handleVerify = async () => {
  //   if (!isLoaded) return;
  //
  //   if (!code.trim()) {
  //     Alert.alert('Error', 'Please enter the verification code');
  //     return;
  //   }
  //
  //   setIsLoading(true);
  //   try {
  //     const completeSignUp = await signUp.attemptEmailAddressVerification({
  //       code: code.trim(),
  //     });
  //
  //     if (completeSignUp.status === 'complete') {
  //       await setActive({ session: completeSignUp.createdSessionId });
  //       console.log('✅ Signup and verification successful!');
  //       console.log('Session ID:', completeSignUp.createdSessionId);
  //       console.log('User ID:', completeSignUp.createdUserId);
  //       // Token will be logged automatically in AuthContext useEffect
  //
  //       try {
  //         await loginInternal(email.trim(), password);
  //       } catch (internalError: any) {
  //         console.error('⚠️ Internal login failed after verification:', internalError);
  //         Alert.alert('Warning', 'Account created, but failed to connect to internal services. Some features may not work.');
  //       }
  //       router.replace('/(tabs)');
  //     } else {
  //       Alert.alert('Error', 'Verification incomplete. Please try again.');
  //     }
  //   } catch (error: any) {
  //     Alert.alert('Verification Failed', error.errors?.[0]?.message || 'Invalid verification code');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Note: Signup should be handled by your internal API
  // For now, this screen shows a message to contact support
  const handleSignup = async () => {
    Alert.alert(
      'Sign Up',
      'Please contact support to create an account, or use the login screen if you already have an account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go to Login', onPress: () => router.replace('/login') },
      ]
    );
  };

  // CLERK CODE COMMENTED OUT - Verification flow removed
  // if (pendingVerification) {
  //   return (
  //     <SafeAreaView style={styles.container}>
  //       <KeyboardAvoidingView
  //         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  //         style={styles.keyboardView}>
  //         <ScrollView
  //           contentContainerStyle={styles.scrollContent}
  //           keyboardShouldPersistTaps="handled">
  //           <View style={styles.header}>
  //             <TouchableOpacity onPress={() => setPendingVerification(false)} style={styles.backButton}>
  //               <IconSymbol name="chevron.left" size={24} color="#0066CC" />
  //             </TouchableOpacity>
  //             <View style={styles.logoContainer}>
  //               <View style={styles.citibankLogo}>
  //                 <View style={styles.logoInner} />
  //               </View>
  //             </View>
  //             <Text style={styles.title}>Verify Email</Text>
  //             <Text style={styles.subtitle}>Enter the code sent to {email}</Text>
  //           </View>
  //
  //           <View style={styles.form}>
  //             <View style={styles.inputContainer}>
  //               <Text style={styles.label}>Verification Code</Text>
  //               <TextInput
  //                 style={styles.input}
  //                 placeholder="Enter verification code"
  //                 placeholderTextColor="#999"
  //                 value={code}
  //                 onChangeText={setCode}
  //                 keyboardType="number-pad"
  //                 autoCapitalize="none"
  //                 autoCorrect={false}
  //                 editable={!isLoading}
  //               />
  //             </View>
  //
  //             <TouchableOpacity
  //               style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
  //               onPress={handleVerify}
  //               disabled={isLoading || !isLoaded}>
  //               {isLoading ? (
  //                 <ActivityIndicator color="white" />
  //               ) : (
  //                 <Text style={styles.signupButtonText}>Verify Email</Text>
  //               )}
  //             </TouchableOpacity>
  //           </View>
  //         </ScrollView>
  //       </KeyboardAvoidingView>
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color="#0066CC" />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={styles.citibankLogo}>
                <View style={styles.logoInner} />
              </View>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password (min 8 characters)"
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
                  style={styles.eyeIcon}>
                  <IconSymbol
                    name={showPassword ? 'eye.slash' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')} disabled={isLoading}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  logoContainer: {
    marginBottom: 16,
    marginTop: 20,
  },
  citibankLogo: {
    width: 60,
    height: 60,
    backgroundColor: '#0066CC',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    padding: 12,
  },
  signupButton: {
    backgroundColor: '#0066CC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#0066CC',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '600',
  },
});
