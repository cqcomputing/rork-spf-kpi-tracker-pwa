import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Plus, Edit, Trash2, Key, X } from "lucide-react-native";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import { useAuthStore } from "@/store/auth-store";
import { User } from "@/types/user";

export default function UsersTab() {
  const { users, user: currentUser, addUser, updateUser, deleteUser, resetUserPin } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "sales_rep" as "sales_rep" | "admin",
  });

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      role: "sales_rep",
    });
    setModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email || "",
      password: user.password,
      role: user.role,
    });
    setModalVisible(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.username || !formData.password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (formData.password.length !== 4) {
      Alert.alert("Error", "PIN must be 4 digits");
      return;
    }

    // Check if username already exists (excluding current user when editing)
    const existingUser = users.find(u => 
      u.username.toLowerCase() === formData.username.toLowerCase() && 
      u.id !== editingUser?.id
    );
    
    if (existingUser) {
      Alert.alert("Error", "Username already exists");
      return;
    }

    setLoading(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        Alert.alert("Success", "User updated successfully");
      } else {
        await addUser({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        Alert.alert("Success", "User created successfully");
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser?.id) {
      Alert.alert("Error", "You cannot delete your own account");
      return;
    }

    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(user.id);
              Alert.alert("Success", "User deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete user");
            }
          }
        },
      ]
    );
  };

  const handleResetPin = (user: User) => {
    Alert.alert(
      "Reset PIN",
      `Reset PIN for ${user.name} to 0000?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          onPress: async () => {
            try {
              await resetUserPin(user.id, "0000");
              Alert.alert("Success", "PIN reset to 0000");
            } catch (error) {
              Alert.alert("Error", "Failed to reset PIN");
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
          <Plus size={20} color={Colors.secondary} />
          <Text style={styles.addButtonText}>Add User</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.usersList}>
        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userInitials}>
                  {user.name.split(" ").map(n => n.charAt(0)).join("").toUpperCase()}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userUsername}>@{user.username}</Text>
                {user.email && <Text style={styles.userEmail}>{user.email}</Text>}
                <Text style={styles.userRole}>
                  {user.role === "admin" ? "Administrator" : "Sales Representative"}
                </Text>
              </View>
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditUser(user)}
              >
                <Edit size={16} color={Colors.blue.medium} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleResetPin(user)}
              >
                <Key size={16} color={Colors.accent} />
              </TouchableOpacity>
              
              {user.id !== currentUser?.id && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteUser(user)}
                >
                  <Trash2 size={16} color={Colors.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add/Edit User Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingUser ? "Edit User" : "Add New User"}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <X size={24} color={Colors.gray.medium} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.formContainer} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.formContentContainer}
              >
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="Enter full name"
                    placeholderTextColor={Colors.gray.medium}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Username *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.username}
                    onChangeText={(text) => setFormData({ ...formData, username: text })}
                    placeholder="Enter username"
                    placeholderTextColor={Colors.gray.medium}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    placeholder="Enter email address"
                    placeholderTextColor={Colors.gray.medium}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PIN *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    placeholder="Enter 4-digit PIN"
                    placeholderTextColor={Colors.gray.medium}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Role *</Text>
                  <View style={styles.roleContainer}>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        formData.role === "sales_rep" && styles.roleButtonActive
                      ]}
                      onPress={() => setFormData({ ...formData, role: "sales_rep" })}
                    >
                      <Text style={[
                        styles.roleButtonText,
                        formData.role === "sales_rep" && styles.roleButtonTextActive
                      ]}>
                        Sales Rep
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        formData.role === "admin" && styles.roleButtonActive
                      ]}
                      onPress={() => setFormData({ ...formData, role: "admin" })}
                    >
                      <Text style={[
                        styles.roleButtonText,
                        formData.role === "admin" && styles.roleButtonTextActive
                      ]}>
                        Admin
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setModalVisible(false)}
                  variant="outline"
                  style={styles.cancelButton}
                />
                <Button
                  title={editingUser ? "Update" : "Create"}
                  onPress={handleSaveUser}
                  loading={loading}
                  style={styles.saveButton}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  addButtonText: {
    color: Colors.secondary,
    fontWeight: "600",
    fontSize: 14,
  },
  usersList: {
    flex: 1,
  },
  userCard: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userInitials: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: Colors.gray.light,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.blue.medium,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: Colors.gray.medium,
  },
  userActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray.darker,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.gray.darkest,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    minHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.darker,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  formContentContainer: {
    paddingVertical: 16,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.primary,
    minHeight: 48,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.gray.darker,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  roleButtonActive: {
    backgroundColor: Colors.accent,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray.light,
  },
  roleButtonTextActive: {
    color: Colors.secondary,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.darker,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});