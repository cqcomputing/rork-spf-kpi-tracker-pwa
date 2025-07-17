import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import Logo from "@/components/Logo";

import { useAuthStore } from "@/store/auth-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const REMEMBER_USER_KEY = "stadium-remember-user";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [rememberUser, setRememberUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const { login } = useAuthStore();
  
  const pinRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Load remembered user on component mount
  useEffect(() => {
    loadRememberedUser();
  }, []);

  // Auto-login when PIN is complete
  useEffect(() => {
    const fullPin = pin.join("");
    if (fullPin.length === 4 && username) {
      handleLogin(fullPin);
    }
  }, [pin, username]);

  const loadRememberedUser = async () => {
    try {
      const rememberedData = await AsyncStorage.getItem(REMEMBER_USER_KEY);
      if (rememberedData) {
        const { username: savedUsername, remember } = JSON.parse(rememberedData);
        setUsername(savedUsername);
        setRememberUser(remember);
      }
    } catch (error) {
      console.error("Failed to load remembered user:", error);
    }
  };

  const saveRememberedUser = async (username: string, remember: boolean) => {
    try {
      if (remember) {
        await AsyncStorage.setItem(REMEMBER_USER_KEY, JSON.stringify({
          username,
          remember: true,
        }));
      } else {
        await AsyncStorage.removeItem(REMEMBER_USER_KEY);
      }
    } catch (error) {
      console.error("Failed to save remembered user:", error);
    }
  };
  
  const handleLogin = async (pinValue?: string) => {
    const fullPin = pinValue || pin.join("");
    
    if (!username || fullPin.length !== 4) {
      setError("Please enter username and complete 4-digit PIN");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const success = await login(username, fullPin);
      
      if (success) {
        // Save remembered user preference
        await saveRememberedUser(username, rememberUser);
        router.replace("/(tabs)");
      } else {
        setError("Invalid username or PIN");
        // Clear PIN on error
        setPin(["", "", "", ""]);
        pinRefs[0].current?.focus();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (value: string, index: number) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handlePinKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !pin[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      pinRefs[index - 1].current?.focus();
    }
  };

  const handleUsernameSubmit = () => {
    if (username) {
      pinRefs[0].current?.focus();
    }
  };

  const clearPin = () => {
    setPin(["", "", "", ""]);
    pinRefs[0].current?.focus();
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            {/* Background Logo */}
            <View style={styles.backgroundLogoContainer}>
              <Image
                source="https://emerald.stadiumpremierfitness.com.au/wp-content/uploads/2025/07/StadiumPremierFitness_LowRes_Primary-Logo_White-scaled.png"
                style={styles.backgroundLogo}
                contentFit="contain"
                transition={300}
              />
            </View>
            
            {/* Main Content */}
            <View style={styles.contentContainer}>
              <View style={styles.headerContainer}>
                <Image
                  source="https://emerald.stadiumpremierfitness.com.au/wp-content/uploads/2025/07/StadiumPremierFitness_LowRes_Primary-Logo_White-scaled.png"
                  style={styles.mainLogo}
                  contentFit="contain"
                  transition={300}
                />
                <Text style={styles.title}>SALES KPI TRACKER</Text>
                <Text style={styles.subtitle}>Track your performance goals</Text>
              </View>
              
              <View style={styles.formContainer}>
                <View style={styles.inputSection}>
                  <Text style={styles.label}>USERNAME</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your username"
                      placeholderTextColor={Colors.gray.medium}
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="username"
                      returnKeyType="next"
                      onSubmitEditing={handleUsernameSubmit}
                      editable={!loading}
                      selectTextOnFocus={true}
                    />
                  </View>
                </View>
                
                <View style={styles.inputSection}>
                  <Text style={styles.label}>4-DIGIT PIN</Text>
                  <View style={styles.pinContainer}>
                    {pin.map((digit, index) => (
                      <View key={index} style={styles.pinInputWrapper}>
                        <TextInput
                          ref={pinRefs[index]}
                          style={[
                            styles.pinInput,
                            digit && styles.pinInputFilled,
                            error && styles.pinInputError
                          ]}
                          value={digit}
                          onChangeText={(value) => handlePinChange(value, index)}
                          onKeyPress={({ nativeEvent }) => handlePinKeyPress(nativeEvent.key, index)}
                          secureTextEntry
                          keyboardType="numeric"
                          maxLength={1}
                          textContentType="none"
                          editable={!loading}
                          selectTextOnFocus={true}
                        />
                        {digit && <View style={styles.pinDot} />}
                      </View>
                    ))}
                  </View>
                </View>

                {/* Remember User Toggle */}
                <TouchableOpacity
                  style={styles.rememberContainer}
                  onPress={() => setRememberUser(!rememberUser)}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, rememberUser && styles.checkboxChecked]}>
                    {rememberUser && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>
                
                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
                
                {/* Manual login button for fallback */}
                <Button
                  title="LOGIN"
                  onPress={() => handleLogin()}
                  loading={loading}
                  style={[styles.loginButton, styles.yellowButton]}
                  disabled={!username || pin.join("").length !== 4}
                />
                
                <TouchableOpacity 
                  onPress={clearPin} 
                  style={styles.clearButton} 
                  activeOpacity={0.6}
                >
                  <Text style={styles.clearButtonText}>Clear PIN</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.footerContainer}>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  inner: {
    flex: 1,
    position: 'relative',
  },
  backgroundLogoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.03,
    zIndex: 0,
  },
  backgroundLogo: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.4,
    maxWidth: 400,
    maxHeight: 300,
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  mainLogo: {
    width: 180,
    height: 90,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.secondary,
    textAlign: "center",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray.medium,
    textAlign: "center",
    fontWeight: "400",
  },
  formContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
  },
  inputSection: {
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.accent,
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    shadowColor: Colors.accent,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    fontSize: 17,
    color: Colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 192, 69, 0.3)',
    minHeight: 56,
    fontWeight: '500',
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  pinInputWrapper: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
  },
  pinInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingVertical: 20,
    fontSize: 24,
    color: 'transparent',
    textAlign: "center",
    borderWidth: 2,
    borderColor: 'rgba(255, 192, 69, 0.3)',
    minHeight: 70,
    fontWeight: "bold",
    shadowColor: Colors.accent,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  pinInputFilled: {
    borderColor: Colors.accent,
    borderWidth: 2,
    shadowOpacity: 0.2,
  },
  pinInputError: {
    borderColor: Colors.error,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  pinDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -6 }, { translateY: -6 }],
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    marginTop: 8,
    paddingVertical: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.gray.medium,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  checkboxChecked: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkmark: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  rememberText: {
    fontSize: 15,
    color: Colors.secondary,
    fontWeight: '400',
  },
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  errorText: {
    color: Colors.error,
    textAlign: "center",
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    width: "100%",
    shadowColor: Colors.accent,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  clearButton: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clearButtonText: {
    color: Colors.gray.medium,
    fontSize: 15,
    fontWeight: '500',
  },
  footerContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  hint: {
    color: Colors.gray.medium,
    textAlign: "center",
    fontSize: 13,
    fontWeight: '400',
    opacity: 0.8,
    marginBottom: 16,
  },
  yellowButton: {
    backgroundColor: '#ffbf26',
  },
});