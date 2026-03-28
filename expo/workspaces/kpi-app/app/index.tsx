import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';

const LoginScreen = () => {
  const router = useRouter();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for PIN input fields with explicit type
  const pinRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    loadRememberedUser();
  }, []);

  useEffect(() => {
    if (pin.every(digit => digit.length === 1)) {
      handleLogin();
    }
  }, [pin]);

  const loadRememberedUser = async () => {
    try {
      const savedUsername = await AsyncStorage.getItem('rememberedUser');
      if (savedUsername) {
        setUsername(savedUsername);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Failed to load remembered user', error);
    }
  };

  const handlePinChange = (value: string, index: number) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3 && pinRefs.current[index + 1]) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handleLogin = async () => {
    if (!username || pin.some(digit => !digit)) {
      Alert.alert('Error', 'Please enter username and full PIN');
      return;
    }

    setIsLoading(true);
    try {
      const pinCode = pin.join('');
      await login(username, pinCode);
      if (rememberMe) {
        await AsyncStorage.setItem('rememberedUser', username);
      } else {
        await AsyncStorage.removeItem('rememberedUser');
      }
      router.replace('/');
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: 'https://emerald.stadiumpremierfitness.com.au/wp-content/uploads/2025/07/StadiumPremierFitness_LowRes_Primary-Logo_White-scaled.png' }} 
        style={styles.logo} 
        resizeMode="contain" 
      /><Text style={styles.title}>Username</Text><TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
        autoCapitalize="none"
      /><Text style={styles.title}>4-digit PIN</Text><View style={styles.pinContainer}>{pin.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.pinInput}
            value={digit}
            onChangeText={(value) => handlePinChange(value, index)}
            keyboardType="numeric"
            maxLength={1}
            ref={(ref) => {
              pinRefs.current[index] = ref;
            }}
            secureTextEntry
          />
        ))}</View><View style={styles.rememberContainer}><TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setRememberMe(!rememberMe)}
        ><View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} /><Text style={styles.rememberText}>Remember me</Text></TouchableOpacity></View><TouchableOpacity 
        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
        onPress={handleLogin}
        disabled={isLoading}
      ><Text style={styles.loginButtonText}>{isLoading ? 'Logging in...' : 'Login'}</Text></TouchableOpacity>    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 300,
    height: 120,
    marginBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  pinInput: {
    width: 60,
    height: 60,
    backgroundColor: '#2a2a2a',
    color: '#fff',
    textAlign: 'center',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  rememberContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 4,
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#ffbf26',
  },
  rememberText: {
    color: '#fff',
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#ffbf26',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
