import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Plus, Edit, Trash2, X, Palette } from "lucide-react-native";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import { KPI_ACTIONS, KPI_CATEGORIES, KpiAction, KpiCategory } from "@/constants/kpis";
import { useAdminStore } from "@/store/admin-store";

const CATEGORY_COLORS = [
  "#4DA6FF", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", 
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9", "#F8C471"
];

export default function KpiActionsTab() {
  const { 
    kpiActions, 
    kpiCategories, 
    addKpiAction, 
    updateKpiAction, 
    deleteKpiAction,
    addKpiCategory,
    updateKpiCategory,
    deleteKpiCategory
  } = useAdminStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingAction, setEditingAction] = useState<KpiAction | null>(null);
  const [editingCategory, setEditingCategory] = useState<KpiCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    points: "",
    categoryId: "",
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    color: CATEGORY_COLORS[0],
  });

  // Merge admin store data with constants, prioritizing admin store
  const allCategories = kpiCategories.length > 0 ? kpiCategories : KPI_CATEGORIES;
  const allActions = kpiActions.length > 0 ? kpiActions : KPI_ACTIONS;

  const handleAddAction = () => {
    setEditingAction(null);
    setFormData({
      name: "",
      description: "",
      points: "",
      categoryId: allCategories[0]?.id || "",
    });
    setModalVisible(true);
  };

  const handleEditAction = (action: KpiAction) => {
    setEditingAction(action);
    setFormData({
      name: action.name,
      description: action.description,
      points: action.points.toString(),
      categoryId: action.category.id,
    });
    setModalVisible(true);
  };

  const handleSaveAction = async () => {
    if (!formData.name || !formData.description || !formData.points) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const points = parseInt(formData.points);
    if (isNaN(points) || points <= 0) {
      Alert.alert("Error", "Points must be a positive number");
      return;
    }

    const category = allCategories.find(c => c.id === formData.categoryId);
    if (!category) {
      Alert.alert("Error", "Please select a valid category");
      return;
    }

    setLoading(true);
    try {
      const actionData = {
        name: formData.name,
        description: formData.description,
        points,
        category,
      };

      if (editingAction) {
        await updateKpiAction(editingAction.id, actionData);
        Alert.alert("Success", "KPI action updated successfully");
      } else {
        await addKpiAction(actionData);
        Alert.alert("Success", "KPI action created successfully");
      }
      setModalVisible(false);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        points: "",
        categoryId: allCategories[0]?.id || "",
      });
    } catch (error) {
      console.error("Error saving action:", error);
      Alert.alert("Error", "Failed to save KPI action");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAction = (action: KpiAction) => {
    Alert.alert(
      "Delete KPI Action",
      `Are you sure you want to delete "${action.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteKpiAction(action.id);
              Alert.alert("Success", "KPI action deleted successfully");
            } catch (error) {
              console.error("Error deleting action:", error);
              Alert.alert("Error", "Failed to delete KPI action");
            }
          }
        },
      ]
    );
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: "",
      color: CATEGORY_COLORS[0],
    });
    setCategoryModalVisible(true);
  };

  const handleEditCategory = (category: KpiCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      color: category.color,
    });
    setCategoryModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    setLoading(true);
    try {
      const categoryData = {
        name: categoryFormData.name.trim(),
        color: categoryFormData.color,
        icon: "target", // Default icon for new categories
      };

      if (editingCategory) {
        await updateKpiCategory(editingCategory.id, categoryData);
        Alert.alert("Success", "Category updated successfully");
      } else {
        await addKpiCategory(categoryData);
        Alert.alert("Success", "Category created successfully");
      }
      setCategoryModalVisible(false);
      
      // Reset form
      setCategoryFormData({
        name: "",
        color: CATEGORY_COLORS[0],
      });
    } catch (error) {
      console.error("Error saving category:", error);
      Alert.alert("Error", "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = (category: KpiCategory) => {
    const actionsInCategory = allActions.filter(action => action.category.id === category.id);
    
    if (actionsInCategory.length > 0) {
      Alert.alert("Cannot Delete", "This category contains KPI actions. Please move or delete the actions first.");
      return;
    }

    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteKpiCategory(category.id);
              Alert.alert("Success", "Category deleted successfully");
            } catch (error) {
              console.error("Error deleting category:", error);
              Alert.alert("Error", "Failed to delete category");
            }
          }
        },
      ]
    );
  };

  const getActionsByCategory = () => {
    const actionsByCategory: Record<string, KpiAction[]> = {};
    
    allCategories.forEach(category => {
      actionsByCategory[category.id] = allActions.filter(
        action => action.category.id === category.id
      );
    });
    
    return actionsByCategory;
  };

  const actionsByCategory = getActionsByCategory();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>KPI Actions</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.addCategoryButton} onPress={handleAddCategory}>
            <Palette size={16} color={Colors.secondary} />
            <Text style={styles.addCategoryButtonText}>Category</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddAction}>
            <Plus size={20} color={Colors.secondary} />
            <Text style={styles.addButtonText}>Action</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.actionsList}>
        {allCategories.map((category) => (
          <View key={category.id} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryIndicator, { backgroundColor: category.color }]} />
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <View style={styles.categoryActions}>
                <TouchableOpacity
                  style={styles.categoryActionButton}
                  onPress={() => handleEditCategory(category)}
                >
                  <Edit size={14} color={Colors.blue.medium} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.categoryActionButton}
                  onPress={() => handleDeleteCategory(category)}
                >
                  <Trash2 size={14} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>

            {actionsByCategory[category.id]?.map((action) => (
              <View key={action.id} style={styles.actionCard}>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionName}>{action.name}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                  <Text style={styles.actionPoints}>{action.points} points</Text>
                </View>

                <View style={styles.actionActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditAction(action)}
                  >
                    <Edit size={16} color={Colors.blue.medium} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteAction(action)}
                  >
                    <Trash2 size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Add/Edit Action Modal */}
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
                  {editingAction ? "Edit KPI Action" : "Add New KPI Action"}
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
                  <Text style={styles.inputLabel}>Action Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="Enter action name"
                    placeholderTextColor={Colors.gray.medium}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    placeholder="Enter action description"
                    placeholderTextColor={Colors.gray.medium}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Points</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.points}
                    onChangeText={(text) => setFormData({ ...formData, points: text })}
                    placeholder="Enter point value"
                    placeholderTextColor={Colors.gray.medium}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <View style={styles.categoryButtons}>
                    {allCategories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryButton,
                          formData.categoryId === category.id && styles.categoryButtonActive
                        ]}
                        onPress={() => setFormData({ ...formData, categoryId: category.id })}
                      >
                        <View style={[styles.categoryButtonIndicator, { backgroundColor: category.color }]} />
                        <Text style={[
                          styles.categoryButtonText,
                          formData.categoryId === category.id && styles.categoryButtonTextActive
                        ]}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
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
                  title={editingAction ? "Update" : "Create"}
                  onPress={handleSaveAction}
                  loading={loading}
                  style={styles.saveButton}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Add/Edit Category Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setCategoryModalVisible(false)}
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
                  <Text style={styles.inputLabel}>Category Name</Text>
                  <TextInput
                    style={styles.input}
                    value={categoryFormData.name}
                    onChangeText={(text) => setCategoryFormData({ ...categoryFormData, name: text })}
                    placeholder="Enter category name"
                    placeholderTextColor={Colors.gray.medium}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Color</Text>
                  <View style={styles.colorPicker}>
                    {CATEGORY_COLORS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          categoryFormData.color === color && styles.colorOptionSelected
                        ]}
                        onPress={() => setCategoryFormData({ ...categoryFormData, color })}
                      />
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setCategoryModalVisible(false)}
                  variant="outline"
                  style={styles.cancelButton}
                />
                <Button
                  title={editingCategory ? "Update" : "Create"}
                  onPress={handleSaveCategory}
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
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  addCategoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blue.medium,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addCategoryButtonText: {
    color: Colors.secondary,
    fontWeight: "600",
    fontSize: 12,
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
  actionsList: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  categoryActions: {
    flexDirection: "row",
    gap: 8,
  },
  categoryActionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray.darker,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCard: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  actionInfo: {
    flex: 1,
    marginRight: 12,
  },
  actionName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: Colors.gray.light,
    marginBottom: 8,
    lineHeight: 20,
  },
  actionPoints: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.accent,
  },
  actionActions: {
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
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.secondary,
    flex: 1,
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  categoryButtons: {
    gap: 8,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray.darker,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    minHeight: 48,
  },
  categoryButtonActive: {
    backgroundColor: Colors.accent,
  },
  categoryButtonIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray.light,
    flex: 1,
  },
  categoryButtonTextActive: {
    color: Colors.secondary,
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: Colors.secondary,
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