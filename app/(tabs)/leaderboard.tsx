import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native";
import { Stack } from "expo-router";
import Colors from "@/constants/colors";
import UserHeader from "@/components/UserHeader";
import ProgressBar from "@/components/ProgressBar";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import { useKpiStore } from "@/store/kpi-store";
import { useAuthStore } from "@/store/auth-store";
import { useKpiData } from "@/hooks/use-kpi-data";
import { Award, Medal, Trophy, X, Calendar, Target, TrendingUp } from "lucide-react-native";

type UserStats = {
  id: string;
  name: string;
  dailyPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  dailyActions: number;
  weeklyActions: number;
  monthlyActions: number;
  dailyTargetPercentage: number;
  weeklyTargetPercentage: number;
  categoryBreakdown: Record<string, { actions: number; points: number }>;
  rank: number;
};

export default function LeaderboardScreen() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("weekly");
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const { entries, getTeamMonthlyProgress, getDailyProgress, getWeeklyProgress } = useKpiStore();
  const { users, user: currentUser } = useAuthStore();
  const { actions, categories } = useKpiData();
  
  const teamProgress = getTeamMonthlyProgress();
  
  // Calculate user statistics
  const userStats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    
    // Calculate week dates
    const day = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    // Calculate month dates
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const stats: UserStats[] = users.map(user => {
      const userEntries = entries.filter(entry => entry.userId === user.id);
      
      // Daily stats
      const dailyEntries = userEntries.filter(entry => entry.date === today);
      const dailyPoints = dailyEntries.reduce((sum, entry) => {
        const action = actions.find(a => a.id === entry.actionId);
        return sum + (action ? action.points : 0);
      }, 0);
      
      // Weekly stats
      const weeklyEntries = userEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startOfWeek && entryDate <= endOfWeek;
      });
      const weeklyPoints = weeklyEntries.reduce((sum, entry) => {
        const action = actions.find(a => a.id === entry.actionId);
        return sum + (action ? action.points : 0);
      }, 0);
      
      // Monthly stats
      const monthlyEntries = userEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startOfMonth && entryDate <= endOfMonth;
      });
      const monthlyPoints = monthlyEntries.reduce((sum, entry) => {
        const action = actions.find(a => a.id === entry.actionId);
        return sum + (action ? action.points : 0);
      }, 0);
      
      // Category breakdown for monthly
      const categoryBreakdown: Record<string, { actions: number; points: number }> = {};
      categories.forEach(category => {
        categoryBreakdown[category.id] = { actions: 0, points: 0 };
      });
      
      monthlyEntries.forEach(entry => {
        const action = actions.find(a => a.id === entry.actionId);
        if (action) {
          const categoryId = action.category.id;
          categoryBreakdown[categoryId].actions += 1;
          categoryBreakdown[categoryId].points += action.points;
        }
      });
      
      // Calculate target percentages (using default targets for now)
      const dailyTargetPercentage = Math.min(100, Math.round((dailyPoints / 40) * 100));
      const weeklyTargetPercentage = Math.min(100, Math.round((weeklyPoints / 120) * 100));
      
      return {
        id: user.id,
        name: user.name,
        dailyPoints,
        weeklyPoints,
        monthlyPoints,
        dailyActions: dailyEntries.length,
        weeklyActions: weeklyEntries.length,
        monthlyActions: monthlyEntries.length,
        dailyTargetPercentage,
        weeklyTargetPercentage,
        categoryBreakdown,
        rank: 0, // Will be set after sorting
      };
    });
    
    // Sort by the selected timeframe and assign ranks
    const sortedStats = stats.sort((a, b) => {
      const pointsA = timeframe === "weekly" ? a.weeklyPoints : a.monthlyPoints;
      const pointsB = timeframe === "weekly" ? b.weeklyPoints : b.monthlyPoints;
      return pointsB - pointsA;
    });
    
    // Assign ranks
    sortedStats.forEach((stat, index) => {
      stat.rank = index + 1;
    });
    
    return sortedStats;
  }, [entries, users, actions, categories, timeframe]);
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={24} color="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Medal size={24} color="#CD7F32" />;
      default:
        return <Text style={styles.rankText}>{rank}</Text>;
    }
  };
  
  const handleUserPress = (user: UserStats) => {
    setSelectedUser(user);
    setModalVisible(true);
  };
  
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Unknown Category";
  };
  
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : Colors.gray.medium;
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Logo size="small" />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>TEAM LEADERBOARD</Text>
          </View>
          <UserHeader />
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>TEAM MONTHLY TARGET</Text>
          <ProgressBar 
            progress={teamProgress.percentage} 
            height={24} 
            color={Colors.accent}
          />
          <Text style={styles.progressValue}>
            {teamProgress.current}/{teamProgress.target}
          </Text>
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, timeframe === "weekly" && styles.activeTab]}
            onPress={() => setTimeframe("weekly")}
          >
            <Text style={[styles.tabText, timeframe === "weekly" && styles.activeTabText]}>
              WEEKLY
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, timeframe === "monthly" && styles.activeTab]}
            onPress={() => setTimeframe("monthly")}
          >
            <Text style={[styles.tabText, timeframe === "monthly" && styles.activeTabText]}>
              MONTHLY
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.leaderboardContainer}>
          {userStats.map((user) => (
            <TouchableOpacity
              key={user.id} 
              style={[
                styles.leaderboardRow,
                user.id === currentUser?.id && styles.currentUserRow
              ]}
              onPress={() => handleUserPress(user)}
              activeOpacity={0.7}
            >
              <View style={styles.rankContainer}>
                {getRankIcon(user.rank)}
              </View>
              
              <Text style={styles.userName}>{user.name}</Text>
              
              <View style={styles.pointsContainer}>
                <Text style={styles.pointsText}>
                  {timeframe === "weekly" ? user.weeklyPoints : user.monthlyPoints}
                </Text>
                <Award size={16} color={Colors.accent} style={styles.pointsIcon} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Current user stats */}
        {currentUser && (
          <View style={styles.statsContainer}>
            {(() => {
              const currentUserStats = userStats.find(u => u.id === currentUser.id);
              if (!currentUserStats) return null;
              
              return (
                <>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{currentUserStats.rank}</Text>
                    <Text style={styles.statLabel}>Your Rank</Text>
                  </View>
                  
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {timeframe === "weekly" ? currentUserStats.weeklyPoints : currentUserStats.monthlyPoints}
                    </Text>
                    <Text style={styles.statLabel}>Your Points</Text>
                  </View>
                  
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {timeframe === "weekly" ? currentUserStats.weeklyActions : currentUserStats.monthlyActions}
                    </Text>
                    <Text style={styles.statLabel}>Actions</Text>
                  </View>
                </>
              );
            })()}
          </View>
        )}
      </View>
      
      {/* User Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedUser && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalUserInfo}>
                    <View style={styles.modalUserAvatar}>
                      <Text style={styles.modalUserInitials}>
                        {selectedUser.name.split(" ").map(n => n.charAt(0)).join("").toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.modalUserName}>{selectedUser.name}</Text>
                      <Text style={styles.modalUserRank}>Rank #{selectedUser.rank}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <X size={24} color={Colors.gray.medium} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {/* Daily Stats */}
                  <View style={styles.statsSection}>
                    <View style={styles.statsSectionHeader}>
                      <Calendar size={20} color={Colors.accent} />
                      <Text style={styles.statsSectionTitle}>Daily Stats</Text>
                    </View>
                    
                    <View style={styles.statsGrid}>
                      <View style={styles.statItem}>
                        <Text style={styles.statItemValue}>{selectedUser.dailyActions}</Text>
                        <Text style={styles.statItemLabel}>KPIs Completed</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statItemValue}>{selectedUser.dailyPoints}</Text>
                        <Text style={styles.statItemLabel}>Points Earned</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statItemValue}>{selectedUser.dailyTargetPercentage}%</Text>
                        <Text style={styles.statItemLabel}>To Target</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Monthly Stats */}
                  <View style={styles.statsSection}>
                    <View style={styles.statsSectionHeader}>
                      <TrendingUp size={20} color={Colors.blue.medium} />
                      <Text style={styles.statsSectionTitle}>Monthly Stats</Text>
                    </View>
                    
                    <View style={styles.statsGrid}>
                      <View style={styles.statItem}>
                        <Text style={styles.statItemValue}>{selectedUser.monthlyActions}</Text>
                        <Text style={styles.statItemLabel}>Total KPIs</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statItemValue}>{selectedUser.monthlyPoints}</Text>
                        <Text style={styles.statItemLabel}>Total Points</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statItemValue}>#{selectedUser.rank}</Text>
                        <Text style={styles.statItemLabel}>Overall Rank</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Category Breakdown */}
                  <View style={styles.statsSection}>
                    <View style={styles.statsSectionHeader}>
                      <Target size={20} color={Colors.success} />
                      <Text style={styles.statsSectionTitle}>Category Breakdown</Text>
                    </View>
                    
                    <View style={styles.categoryBreakdown}>
                      {Object.entries(selectedUser.categoryBreakdown).map(([categoryId, data]) => {
                        if (data.actions === 0) return null;
                        
                        return (
                          <View key={categoryId} style={styles.categoryItem}>
                            <View style={styles.categoryHeader}>
                              <View style={[
                                styles.categoryIndicator, 
                                { backgroundColor: getCategoryColor(categoryId) }
                              ]} />
                              <Text style={styles.categoryName}>
                                {getCategoryName(categoryId)}
                              </Text>
                            </View>
                            <View style={styles.categoryStats}>
                              <Text style={styles.categoryActions}>{data.actions} actions</Text>
                              <Text style={styles.categoryPoints}>{data.points} pts</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </ScrollView>
                
                <View style={styles.modalFooter}>
                  <Button
                    title="View Full Report"
                    onPress={() => {
                      setModalVisible(false);
                      // Navigate to detailed report view - placeholder for now
                      console.log("Navigate to full report for user:", selectedUser.name);
                    }}
                    style={styles.fullReportButton}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  progressSection: {
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: "center",
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.gray.darkest,
    borderRadius: 30,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 30,
  },
  activeTab: {
    backgroundColor: Colors.accent,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  activeTabText: {
    color: Colors.secondary,
  },
  leaderboardContainer: {
    flex: 1,
    marginBottom: 16,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.darkest,
    borderRadius: 8,
    marginBottom: 4,
  },
  currentUserRow: {
    backgroundColor: Colors.gray.darkest,
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    color: Colors.secondary,
    marginLeft: 8,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.accent,
    marginRight: 4,
  },
  pointsIcon: {
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.gray.darkest,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.gray.darkest,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
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
  modalUserInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalUserInitials: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  modalUserName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  modalUserRank: {
    fontSize: 14,
    color: Colors.gray.medium,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statsSection: {
    marginVertical: 16,
  },
  statsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.gray.darker,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statItemValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.accent,
    marginBottom: 4,
  },
  statItemLabel: {
    fontSize: 12,
    color: Colors.gray.light,
    textAlign: "center",
  },
  categoryBreakdown: {
    backgroundColor: Colors.gray.darker,
    borderRadius: 12,
    padding: 16,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.darkest,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: Colors.secondary,
    flex: 1,
  },
  categoryStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryActions: {
    fontSize: 12,
    color: Colors.gray.light,
  },
  categoryPoints: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.accent,
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.darker,
  },
  fullReportButton: {
    width: "100%",
  },
});