import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Users, Target, BarChart3, FileText } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuthStore } from "@/store/auth-store";
import UsersTab from "@/components/admin/UsersTab";
import KpiActionsTab from "@/components/admin/KpiActionsTab";
import TargetsTab from "@/components/admin/TargetsTab";
import ReportsTab from "@/components/admin/ReportsTab";

type TabType = "users" | "kpi-actions" | "targets" | "reports";

export default function AdminSettingsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const { user } = useAuthStore();
  const router = useRouter();

  // Redirect if not admin
  React.useEffect(() => {
    if (!user || user.role !== "admin") {
      router.replace("/(tabs)");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") {
    return null;
  }

  const tabs = [
    { id: "users" as TabType, label: "Users", icon: Users },
    { id: "kpi-actions" as TabType, label: "KPI Actions", icon: Target },
    { id: "targets" as TabType, label: "Targets", icon: BarChart3 },
    { id: "reports" as TabType, label: "Reports", icon: FileText },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return <UsersTab />;
      case "kpi-actions":
        return <KpiActionsTab />;
      case "targets":
        return <TargetsTab />;
      case "reports":
        return <ReportsTab />;
      default:
        return <UsersTab />;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ADMIN SETTINGS</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <IconComponent 
                size={18} 
                color={isActive ? Colors.secondary : Colors.gray.medium} 
              />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.darkest,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.secondary,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.gray.darkest,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  activeTab: {
    backgroundColor: Colors.accent,
  },
  tabText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.gray.medium,
    textAlign: "center",
  },
  activeTabText: {
    color: Colors.secondary,
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
});