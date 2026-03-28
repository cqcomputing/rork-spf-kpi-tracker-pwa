import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import Logo from "@/components/Logo";
import { useAuthStore } from "@/store/auth-store";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(username.trim(), password);
      if (!success) {
        Alert.alert("Error", "Invalid username or password");
      }
    } catch {
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Logo size="large" />
            <Text style={styles.title}>STADIUM FITNESS</Text>
            <Text style={styles.subtitle}>KPI TRACKING SYSTEM</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>USERNAME</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor={Colors.gray.medium}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={Colors.gray.medium}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <Button
              title={isLoading ? "SIGNING IN..." : "SIGN IN"}
              onPress={handleLogin}
              disabled={isLoading}
              size="large"
              style={styles.loginButton}
            />
          </View>

          <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>DEMO ACCOUNTS</Text>
            <View style={styles.demoAccount}>
              <Text style={styles.demoLabel}>Sales Rep:</Text>
              <Text style={styles.demoCredentials}>clayton / 1234</Text>
            </View>
            <View style={styles.demoAccount}>
              <Text style={styles.demoLabel}>Admin:</Text>
              <Text style={styles.demoCredentials}>admin / 0000</Text>
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
    backgroundColor: Colors.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.secondary,
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray.light,
    marginTop: 8,
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.gray.darker,
  },
  loginButton: {
    marginTop: 12,
  },
  demoContainer: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.gray.darker,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.accent,
    marginBottom: 12,
    textAlign: "center",
  },
  demoAccount: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  demoLabel: {
    fontSize: 14,
    color: Colors.gray.light,
  },
  demoCredentials: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
});