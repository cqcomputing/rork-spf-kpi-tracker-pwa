import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { Save, Calendar, Target } from "lucide-react-native";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import { DAILY_TARGET, WEEKLY_TARGET, TEAM_MONTHLY_TARGET } from "@/constants/kpis";
import { useAdminStore } from "@/store/admin-store";

export default function TargetsTab() {
  const { targets, updateTargets } = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [formTargets, setFormTargets] = useState({
    daily: targets.daily.toString(),
    weekly: targets.weekly.toString(),
    monthly: targets.monthly.toString(),
    effectiveDate: targets.effectiveDate,
  });

  const handleSaveTargets = async () => {
    const dailyTarget = parseInt(formTargets.daily);
    const weeklyTarget = parseInt(formTargets.weekly);
    const monthlyTarget = parseInt(formTargets.monthly);

    if (isNaN(dailyTarget) || dailyTarget <= 0) {
      Alert.alert("Error", "Daily target must be a positive number");
      return;
    }

    if (isNaN(weeklyTarget) || weeklyTarget <= 0) {
      Alert.alert("Error", "Weekly target must be a positive number");
      return;
    }

    if (isNaN(monthlyTarget) || monthlyTarget <= 0) {
      Alert.alert("Error", "Monthly target must be a positive number");
      return;
    }

    if (!formTargets.effectiveDate) {
      Alert.alert("Error", "Please select an effective date");
      return;
    }

    setLoading(true);
    try {
      await updateTargets({
        daily: dailyTarget,
        weekly: weeklyTarget,
        monthly: monthlyTarget,
        effectiveDate: formTargets.effectiveDate,
      });
      Alert.alert("Success", "Targets updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update targets");
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    Alert.alert(
      "Reset to Defaults",
      "Are you sure you want to reset all targets to default values?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          onPress: () => {
            setFormTargets({
              daily: DAILY_TARGET.toString(),
              weekly: WEEKLY_TARGET.toString(),
              monthly: TEAM_MONTHLY_TARGET.toString(),
              effectiveDate: new Date().toISOString().split("T")[0],
            });
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Target Management</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Current Active Targets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Active Targets</Text>
          
          <View style={styles.targetCard}>
            <View style={styles.targetHeader}>
              <Target size={20} color={Colors.accent} />
              <Text style={styles.targetTitle}>Individual Targets</Text>
            </View>
            
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>Daily Target</Text>
              <Text style={styles.targetValue}>{targets.daily} points</Text>
            </View>
            
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>Weekly Target</Text>
              <Text style={styles.targetValue}>{targets.weekly} points</Text>
            </View>
            
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>Team Monthly Target</Text>
              <Text style={styles.targetValue}>{targets.monthly} points</Text>
            </View>

            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>Effective Date</Text>
              <Text style={styles.targetValue}>{targets.effectiveDate}</Text>
            </View>
          </View>
        </View>

        {/* Update Targets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Targets</Text>
          
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Daily Target (points)</Text>
              <TextInput
                style={styles.input}
                value={formTargets.daily}
                onChangeText={(text) => setFormTargets({ ...formTargets, daily: text })}
                keyboardType="numeric"
                placeholder="Enter daily target"
                placeholderTextColor={Colors.gray.medium}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weekly Target (points)</Text>
              <TextInput
                style={styles.input}
                value={formTargets.weekly}
                onChangeText={(text) => setFormTargets({ ...formTargets, weekly: text })}
                keyboardType="numeric"
                placeholder="Enter weekly target"
                placeholderTextColor={Colors.gray.medium}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Team Monthly Target (points)</Text>
              <TextInput
                style={styles.input}
                value={formTargets.monthly}
                onChangeText={(text) => setFormTargets({ ...formTargets, monthly: text })}
                keyboardType="numeric"
                placeholder="Enter monthly target"
                placeholderTextColor={Colors.gray.medium}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Effective Date</Text>
              <View style={styles.dateInputContainer}>
                <Calendar size={20} color={Colors.gray.medium} />
                <TextInput
                  style={styles.dateInput}
                  value={formTargets.effectiveDate}
                  onChangeText={(text) => setFormTargets({ ...formTargets, effectiveDate: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.gray.medium}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Target History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target History</Text>
          
          <View style={styles.historyCard}>
            <View style={styles.historyItem}>
              <View style={styles.historyDate}>
                <Text style={styles.historyDateText}>{targets.effectiveDate}</Text>
                <Text style={styles.historyStatus}>Active</Text>
              </View>
              <View style={styles.historyTargets}>
                <Text style={styles.historyText}>
                  Daily: {targets.daily} | Weekly: {targets.weekly} | Monthly: {targets.monthly}
                </Text>
              </View>
            </View>
            
            <View style={styles.historyItem}>
              <View style={styles.historyDate}>
                <Text style={styles.historyDateText}>2023-10-01</Text>
                <Text style={styles.historyStatusInactive}>Inactive</Text>
              </View>
              <View style={styles.historyTargets}>
                <Text style={styles.historyText}>Daily: 35 | Weekly: 100 | Monthly: 800</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Reset to Defaults"
          onPress={handleResetToDefaults}
          variant="outline"
          style={styles.resetButton}
        />
        <Button
          title="Save Changes"
          onPress={handleSaveTargets}
          loading={loading}
          style={styles.saveButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.secondary,
    marginBottom: 12,
  },
  targetCard: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 12,
    padding: 16,
  },
  targetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  targetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.secondary,
  },
  targetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.darker,
  },
  targetLabel: {
    fontSize: 14,
    color: Colors.gray.light,
  },
  targetValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.accent,
  },
  formCard: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 12,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.primary,
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dateInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.primary,
  },
  historyCard: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 12,
    padding: 16,
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.darker,
  },
  historyDate: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  historyDateText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.success,
    backgroundColor: Colors.gray.darker,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  historyStatusInactive: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.gray.medium,
    backgroundColor: Colors.gray.darker,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  historyTargets: {
    marginTop: 4,
  },
  historyText: {
    fontSize: 13,
    color: Colors.gray.light,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 16,
  },
  resetButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});