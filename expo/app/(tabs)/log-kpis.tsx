import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Colors from "@/constants/colors";
import KpiCategory from "@/components/KpiCategory";
import KpiAction from "@/components/KpiAction";
import Button from "@/components/Button";
import UserHeader from "@/components/UserHeader";
import Logo from "@/components/Logo";
import { useKpiStore } from "@/store/kpi-store";
import { useAuthStore } from "@/store/auth-store";
import { useKpiData } from "@/hooks/use-kpi-data";
import { KpiAction as KpiActionType } from "@/constants/kpis";
import { BarChart3 } from "lucide-react-native";

export default function LogKpisScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { 
    selectedActions, 
    setActionQuantity, 
    submitActions, 
    resetSelectedActions
  } = useKpiStore();
  
  // Use the hook to get current KPI data
  const { categories, actions, getActionsByCategory } = useKpiData();
  
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  // Check authentication status
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);
  
  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Force re-render by clearing and resetting expanded categories
      setExpandedCategories([]);
    }, [])
  );
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const handleSubmit = () => {
    const totalActions = Object.values(selectedActions).reduce((sum, qty) => sum + qty, 0);
    
    if (totalActions === 0) {
      Alert.alert("No Actions Selected", "Please select at least one action to submit.");
      return;
    }
    
    submitActions();
    Alert.alert(
      "KPIs Submitted!",
      "Your KPI actions have been successfully recorded.",
      [
        { 
          text: "View Dashboard", 
          onPress: () => router.push("/(tabs)/") 
        },
        { 
          text: "OK", 
          style: "cancel" 
        },
      ]
    );
  };
  
  const handleViewDashboard = () => {
    router.push("/(tabs)/");
  };
  
  const totalSelectedActions = Object.values(selectedActions).reduce((sum, qty) => sum + qty, 0);
  const actionsByCategory = getActionsByCategory;
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Logo size="small" />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>SALES KPI TRACKER</Text>
          </View>
          <UserHeader />
        </View>
      </View>
      
      {/* Quick Dashboard Access */}
      <View style={styles.dashboardSection}>
        <TouchableOpacity 
          style={styles.viewDashboardButton}
          onPress={handleViewDashboard}
        >
          <BarChart3 size={18} color={Colors.secondary} />
          <Text style={styles.viewDashboardText}>VIEW DASHBOARD</Text>
        </TouchableOpacity>
      </View>
      
      {/* KPI Categories */}
      <View style={styles.contentHeader}>
        <Text style={styles.contentTitle}>LOG YOUR KPI ACTIONS</Text>
        <Text style={styles.contentSubtitle}>
          Select and track your daily sales activities
        </Text>
      </View>
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {categories.map(category => (
          <KpiCategory
            key={category.id}
            category={category}
            expanded={expandedCategories.includes(category.id)}
            onToggle={() => toggleCategory(category.id)}
          >
            {actionsByCategory[category.id]?.map((action: KpiActionType) => (
              <KpiAction
                key={action.id}
                action={action}
                quantity={selectedActions[action.id] || 0}
                onQuantityChange={(quantity) => setActionQuantity(action.id, quantity)}
              />
            ))}
          </KpiCategory>
        ))}
        
        {/* Bottom spacing for scroll */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      {/* Submit Footer */}
      {totalSelectedActions > 0 && (
        <View style={styles.submitSection}>
          <View style={styles.submitSummary}>
            <Text style={styles.submitSummaryText}>
              {totalSelectedActions} action{totalSelectedActions !== 1 ? 's' : ''} selected
            </Text>
            <Text style={styles.submitSummaryPoints}>
              {Object.entries(selectedActions).reduce((total, [actionId, qty]) => {
                const action = actions.find((a: KpiActionType) => a.id === actionId);
                return total + (action ? action.points * qty : 0);
              }, 0)} points
            </Text>
          </View>
          
          <Button
            title="SUBMIT ACTIONS"
            onPress={handleSubmit}
            size="large"
          />
        </View>
      )}
      
      {totalSelectedActions === 0 && (
        <View style={styles.emptyFooter}>
          <Text style={styles.emptyFooterText}>
            Select actions above to track your KPIs
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.darkest,
  },
  headerTop: {
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.secondary,
    textAlign: "center",
  },
  dashboardSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  viewDashboardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  viewDashboardText: {
    color: Colors.secondary,
    fontWeight: "bold",
    fontSize: 14,
  },
  contentHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.secondary,
    marginBottom: 4,
  },
  contentSubtitle: {
    fontSize: 14,
    color: Colors.gray.medium,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  bottomSpacing: {
    height: 20,
  },
  submitSection: {
    backgroundColor: Colors.gray.darkest,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.darker,
  },
  submitSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  submitSummaryText: {
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: "600",
  },
  submitSummaryPoints: {
    fontSize: 16,
    color: Colors.accent,
    fontWeight: "bold",
  },
  emptyFooter: {
    backgroundColor: Colors.gray.darkest,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.darker,
    alignItems: "center",
  },
  emptyFooterText: {
    fontSize: 14,
    color: Colors.gray.medium,
    textAlign: "center",
  },
});