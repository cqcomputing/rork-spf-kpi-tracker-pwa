import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Colors from "@/constants/colors";
import UserHeader from "@/components/UserHeader";
import ProgressBar from "@/components/ProgressBar";
import Button from "@/components/Button";
import Logo from "@/components/Logo";
import { useKpiStore } from "@/store/kpi-store";
import { useKpiData } from "@/hooks/use-kpi-data";
import { useRouter } from "expo-router";
import { TrendingUp, Target, Calendar, Award } from "lucide-react-native";

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");
  const router = useRouter();
  
  const { 
    summary, 
    getDailyProgress, 
    getWeeklyProgress, 
    getTeamMonthlyProgress 
  } = useKpiStore();
  
  // Use the hook to get current KPI data
  const { categories, actions } = useKpiData();
  
  const dailyProgress = getDailyProgress();
  const weeklyProgress = getWeeklyProgress();
  const teamMonthlyProgress = getTeamMonthlyProgress();
  
  const currentProgress = activeTab === "daily" ? dailyProgress : weeklyProgress;
  const currentSummary = activeTab === "daily" ? summary.daily : summary.weekly;
  
  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // This will trigger a re-render with fresh data
    }, [])
  );
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };
  
  const handleLogKpis = () => {
    router.push("/(tabs)/log-kpis");
  };
  
  const handleGenerateReport = () => {
    // In a real app, this would generate a PDF or CSV report
    alert("Report generation would be implemented in a production app");
  };
  
  // Group actions by category for better organization
  const getActionsByCategory = () => {
    const actionsByCategory: Record<string, { action: any; count: number; points: number }[]> = {};
    
    categories.forEach(category => {
      actionsByCategory[category.id] = [];
    });
    
    actions.forEach(action => {
      const count = currentSummary.actions[action.id] || 0;
      const points = count * action.points;
      
      actionsByCategory[action.category.id].push({
        action,
        count,
        points
      });
    });
    
    return actionsByCategory;
  };
  
  const actionsByCategory = getActionsByCategory();
  
  // Calculate category totals
  const getCategoryTotal = (categoryId: string) => {
    return actionsByCategory[categoryId].reduce((sum, item) => sum + item.points, 0);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Logo size="small" />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>PERFORMANCE DASHBOARD</Text>
          </View>
          <UserHeader />
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "daily" && styles.activeTab]}
            onPress={() => setActiveTab("daily")}
          >
            <Calendar size={20} color={activeTab === "daily" ? Colors.secondary : Colors.gray.medium} />
            <Text style={[styles.tabText, activeTab === "daily" && styles.activeTabText]}>
              DAILY
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "weekly" && styles.activeTab]}
            onPress={() => setActiveTab("weekly")}
          >
            <TrendingUp size={20} color={activeTab === "weekly" ? Colors.secondary : Colors.gray.medium} />
            <Text style={[styles.tabText, activeTab === "weekly" && styles.activeTabText]}>
              WEEKLY
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Date Display */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {activeTab === "daily" 
              ? formatDate(summary.daily.date)
              : formatDateRange(summary.weekly.startDate, summary.weekly.endDate)
            }
          </Text>
        </View>
        
        {/* Main Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Target size={24} color={Colors.accent} />
            <Text style={styles.progressTitle}>
              {activeTab === "daily" ? "DAILY" : "WEEKLY"} TARGET
            </Text>
          </View>
          
          <View style={styles.progressStats}>
            <Text style={styles.currentPoints}>{currentProgress.current}</Text>
            <Text style={styles.targetPoints}>/ {currentProgress.target}</Text>
          </View>
          
          <ProgressBar 
            progress={currentProgress.percentage} 
            height={12} 
            color={Colors.accent}
            backgroundColor={Colors.gray.darker}
          />
          
          <Text style={styles.progressPercentage}>
            {currentProgress.percentage}% Complete
          </Text>
        </View>
        
        {/* Team Monthly Progress */}
        <View style={styles.teamCard}>
          <View style={styles.teamHeader}>
            <Award size={20} color={Colors.blue.medium} />
            <Text style={styles.teamTitle}>TEAM MONTHLY PROGRESS</Text>
          </View>
          
          <ProgressBar 
            progress={teamMonthlyProgress.percentage} 
            height={8} 
            color={Colors.blue.medium}
            backgroundColor={Colors.gray.darker}
          />
          
          <Text style={styles.teamStats}>
            {teamMonthlyProgress.current} / {teamMonthlyProgress.target} points
          </Text>
        </View>
        
        {/* Category Breakdown */}
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>PERFORMANCE BREAKDOWN</Text>
          
          {categories.map(category => {
            const categoryTotal = getCategoryTotal(category.id);
            const categoryActions = actionsByCategory[category.id];
            const hasActivity = categoryActions.some(item => item.count > 0);
            
            return (
              <View key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIndicator, { backgroundColor: category.color }]} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryTotal}>{categoryTotal} pts</Text>
                </View>
                
                {hasActivity && (
                  <View style={styles.categoryActions}>
                    {categoryActions.map(({ action, count, points }) => {
                      if (count === 0) return null;
                      
                      return (
                        <View key={action.id} style={styles.actionItem}>
                          <Text style={styles.actionName}>{action.name}</Text>
                          <View style={styles.actionStats}>
                            <Text style={styles.actionCount}>×{count}</Text>
                            <Text style={styles.actionPoints}>{points} pts</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
                
                {!hasActivity && (
                  <Text style={styles.noActivity}>No activity recorded</Text>
                )}
              </View>
            );
          })}
        </View>
        
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {activeTab === "daily" ? "TODAY'S" : "THIS WEEK'S"} SUMMARY
          </Text>
          
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{currentProgress.current}</Text>
              <Text style={styles.summaryLabel}>Total Points</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {Object.values(currentSummary.actions).reduce((sum, count) => sum + count, 0)}
              </Text>
              <Text style={styles.summaryLabel}>Actions Completed</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <Text style={[
                styles.summaryValue, 
                { color: currentProgress.percentage >= 100 ? Colors.success : Colors.accent }
              ]}>
                {currentProgress.percentage}%
              </Text>
              <Text style={styles.summaryLabel}>Target Progress</Text>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="GENERATE REPORT"
            onPress={handleGenerateReport}
            variant="outline"
            style={styles.reportButton}
          />
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button title="LOG KPI" onPress={handleLogKpis} size="large" />
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
  content: {
    flex: 1,
    padding: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.gray.darkest,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: Colors.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.gray.medium,
  },
  activeTabText: {
    color: Colors.secondary,
  },
  dateContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.secondary,
  },
  progressCard: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  progressStats: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 16,
  },
  currentPoints: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.accent,
  },
  targetPoints: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.gray.medium,
    marginLeft: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: Colors.secondary,
    textAlign: "center",
    marginTop: 8,
  },
  teamCard: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  teamHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  teamTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  teamStats: {
    fontSize: 12,
    color: Colors.gray.medium,
    textAlign: "center",
    marginTop: 8,
  },
  breakdownContainer: {
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.secondary,
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
  },
  categoryTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.accent,
  },
  categoryActions: {
    paddingLeft: 16,
  },
  actionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  actionName: {
    flex: 1,
    fontSize: 13,
    color: Colors.gray.light,
  },
  actionStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionCount: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: "600",
  },
  actionPoints: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: "bold",
  },
  noActivity: {
    fontSize: 12,
    color: Colors.gray.medium,
    fontStyle: "italic",
    paddingLeft: 16,
  },
  summaryCard: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  summaryStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.accent,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.gray.medium,
    textAlign: "center",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.gray.darker,
    marginHorizontal: 16,
  },
  actionButtons: {
    marginBottom: 16,
  },
  reportButton: {
    marginBottom: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.darkest,
  },
});