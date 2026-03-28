import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, TextInput } from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useAuthStore } from "@/store/auth-store";
import Button from "./Button";

type UserHeaderProps = {
  showOptions?: boolean;
};

const UserHeader: React.FC<UserHeaderProps> = ({ showOptions = true }) => {
  const { user, logout, changePin } = useAuthStore();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [changePinModalVisible, setChangePinModalVisible] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    setModalVisible(false);
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            await logout();
          }
        },
      ]
    );
  };

  const handleChangePin = () => {
    setModalVisible(false);
    setChangePinModalVisible(true);
  };

  const handleSettings = () => {
    setModalVisible(false);
    router.push("/admin-settings");
  };

  const handlePinChange = async () => {
    if (!currentPin || !newPin || !confirmPin) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert("Error", "New PIN and confirmation do not match");
      return;
    }

    if (newPin.length !== 4) {
      Alert.alert("Error", "PIN must be 4 digits");
      return;
    }

    if (currentPin !== user.password) {
      Alert.alert("Error", "Current PIN is incorrect");
      return;
    }

    setLoading(true);
    try {
      await changePin(newPin);
      Alert.alert("Success", "PIN changed successfully");
      setChangePinModalVisible(false);
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } catch (error) {
      Alert.alert("Error", "Failed to change PIN");
    } finally {
      setLoading(false);
    }
  };

  const closeChangePinModal = () => {
    setChangePinModalVisible(false);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
  };

  return (
    <>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => showOptions && setModalVisible(true)}
        disabled={!showOptions}
      >
        <View style={styles.profileCircle}>
          <Text style={styles.initials}>{getInitials(user.name)}</Text>
        </View>
      </TouchableOpacity>

      {/* Profile Options Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.profileCircleLarge}>
                <Text style={styles.initialsLarge}>{getInitials(user.name)}</Text>
              </View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userRole}>{user.role === "admin" ? "Administrator" : "Sales Representative"}</Text>
            </View>

            <View style={styles.modalOptions}>
              <TouchableOpacity style={styles.optionButton} onPress={handleChangePin}>
                <Text style={styles.optionText}>Change PIN</Text>
              </TouchableOpacity>
              
              {user.role === "admin" && (
                <TouchableOpacity style={styles.optionButton} onPress={handleSettings}>
                  <Text style={styles.optionText}>Settings</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={[styles.optionButton, styles.logoutButton]} onPress={handleLogout}>
                <Text style={[styles.optionText, styles.logoutText]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Change PIN Modal */}
      <Modal
        visible={changePinModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeChangePinModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pinModalContent}>
            <Text style={styles.pinModalTitle}>Change PIN</Text>
            
            <View style={styles.pinInputContainer}>
              <Text style={styles.pinLabel}>Current PIN</Text>
              <TextInput
                style={styles.pinInput}
                value={currentPin}
                onChangeText={setCurrentPin}
                secureTextEntry
                keyboardType="numeric"
                maxLength={4}
                placeholder="Enter current PIN"
                placeholderTextColor={Colors.gray.medium}
              />
            </View>

            <View style={styles.pinInputContainer}>
              <Text style={styles.pinLabel}>New PIN</Text>
              <TextInput
                style={styles.pinInput}
                value={newPin}
                onChangeText={setNewPin}
                secureTextEntry
                keyboardType="numeric"
                maxLength={4}
                placeholder="Enter new PIN"
                placeholderTextColor={Colors.gray.medium}
              />
            </View>

            <View style={styles.pinInputContainer}>
              <Text style={styles.pinLabel}>Confirm New PIN</Text>
              <TextInput
                style={styles.pinInput}
                value={confirmPin}
                onChangeText={setConfirmPin}
                secureTextEntry
                keyboardType="numeric"
                maxLength={4}
                placeholder="Confirm new PIN"
                placeholderTextColor={Colors.gray.medium}
              />
            </View>

            <View style={styles.pinModalButtons}>
              <Button
                title="Cancel"
                onPress={closeChangePinModal}
                variant="outline"
                style={styles.pinCancelButton}
              />
              <Button
                title="Change PIN"
                onPress={handlePinChange}
                loading={loading}
                style={styles.pinConfirmButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  profileButton: {
    padding: 4,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 300,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileCircleLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  initialsLarge: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.secondary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: Colors.gray.medium,
  },
  modalOptions: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: Colors.gray.darker,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: Colors.error,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.secondary,
  },
  logoutText: {
    color: Colors.secondary,
  },
  pinModalContent: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  pinModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.secondary,
    textAlign: "center",
    marginBottom: 24,
  },
  pinInputContainer: {
    marginBottom: 16,
  },
  pinLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: 8,
  },
  pinInput: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: Colors.primary,
    textAlign: "center",
  },
  pinModalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  pinCancelButton: {
    flex: 1,
  },
  pinConfirmButton: {
    flex: 1,
  },
});

export default UserHeader;