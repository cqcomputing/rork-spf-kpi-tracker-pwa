import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Download, Filter, Calendar, User, FileText, X, Mail } from "lucide-react-native";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import { useKpiStore } from "@/store/kpi-store";
import { useAuthStore } from "@/store/auth-store";
import { useKpiData } from "@/hooks/use-kpi-data";
import { trpc } from "@/lib/trpc";

type DateRangeType = "today" | "week" | "month" | "quarter" | "6months" | "custom";

const DatePicker: React.FC<{
  value: string;
  onChange: (date: string) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => {
  if (Platform.OS === 'web') {
    return (
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          backgroundColor: Colors.secondary,
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '14px',
          color: Colors.primary,
          border: 'none',
          outline: 'none',
          width: '100%',
          height: '40px',
        }}
      />
    );
  }

  // For mobile, use TextInput with date format validation
  return (
    <TextInput
      style={styles.dateInput}
      value={value}
      onChangeText={(text) => {
        // Basic date format validation for mobile
        if (text.match(/^\d{4}-\d{2}-\d{2}$/) || text.length <= 10) {
          onChange(text);
        }
      }}
      placeholder={placeholder}
      placeholderTextColor={Colors.gray.medium}
    />
  );
};

export default function ReportsTab() {
  const [dateRange, setDateRange] = useState<DateRangeType>("month");
  const [selectedUsers, setSelectedUsers] = useState<string[]>(["all"]);
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailFormat, setEmailFormat] = useState<"pdf" | "csv">("pdf");
  const [selectedEmailUser, setSelectedEmailUser] = useState<string>("custom");
  const [customEmail, setCustomEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { entries } = useKpiStore();
  const { users } = useAuthStore();
  const { actions } = useKpiData(); // Use the hook to get current actions

  const handleExportCSV = () => {
    Alert.alert("Export CSV", "CSV export functionality would be implemented here");
  };

  const handleExportPDF = () => {
    Alert.alert("Export PDF", "PDF export functionality would be implemented here");
  };

  const handleEmailReport = () => {
    setEmailModalVisible(true);
  };

  const emailReportMutation = trpc.reports.email.useMutation();

  const handleSendEmail = async () => {
    if (selectedEmailUser === "custom" && !customEmail) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    const emailAddress = selectedEmailUser === "custom" 
      ? customEmail 
      : users.find(u => u.id === selectedEmailUser)?.email;

    if (!emailAddress) {
      Alert.alert("Error", "Selected user does not have an email address");
      return;
    }

    setLoading(true);
    try {
      // Prepare report data
      const reportData = {
        dateRange: getDateRangeLabel(),
        totalEntries: summary.totalEntries,
        totalPoints: summary.totalPoints,
        actionBreakdown: summary.actionBreakdown,
        userBreakdown: summary.userBreakdown,
        filteredEntries: filteredEntries.map(entry => ({
          id: entry.id,
          userId: entry.userId,
          actionId: entry.actionId,
          date: entry.date,
          notes: entry.notes || '',
        })),
      };

      // Send email via tRPC
      const result = await emailReportMutation.mutateAsync({
        to: emailAddress,
        format: emailFormat,
        reportData,
      });

      Alert.alert("Email Sent", result.message);
      setEmailModalVisible(false);
      setCustomEmail('');
    } catch (error) {
      console.error('Email sending failed:', error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    if (userId === "all") {
      setSelectedUsers(["all"]);
    } else {
      const newSelection = selectedUsers.includes("all") 
        ? [userId]
        : selectedUsers.includes(userId)
          ? selectedUsers.filter(id => id !== userId)
          : [...selectedUsers.filter(id => id !== "all"), userId];
      
      setSelectedUsers(newSelection.length === 0 ? ["all"] : newSelection);
    }
  };

  const getFilteredEntries = () => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (dateRange) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "custom":
        if (customDateFrom && customDateTo) {
          startDate = new Date(customDateFrom);
          endDate = new Date(customDateTo);
          endDate.setDate(endDate.getDate() + 1); // Include the end date
        }
        break;
    }

    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const matchesDate = dateRange === "custom" 
        ? (customDateFrom && customDateTo && entryDate >= startDate && entryDate < endDate)
        : entryDate >= startDate && entryDate <= endDate;
      
      const matchesUser = selectedUsers.includes("all") || selectedUsers.includes(entry.userId);
      return matchesDate && matchesUser;
    });
  };

  const filteredEntries = getFilteredEntries();

  const getReportSummary = () => {
    const summary = {
      totalEntries: filteredEntries.length,
      totalPoints: 0,
      actionBreakdown: {} as Record<string, number>,
      userBreakdown: {} as Record<string, { entries: number; points: number }>,
    };

    filteredEntries.forEach(entry => {
      const action = actions.find(a => a.id === entry.actionId);
      const points = action ? action.points : 0;
      
      summary.totalPoints += points;
      
      // Action breakdown
      summary.actionBreakdown[entry.actionId] = 
        (summary.actionBreakdown[entry.actionId] || 0) + 1;
      
      // User breakdown
      if (!summary.userBreakdown[entry.userId]) {
        summary.userBreakdown[entry.userId] = { entries: 0, points: 0 };
      }
      summary.userBreakdown[entry.userId].entries += 1;
      summary.userBreakdown[entry.userId].points += points;
    });

    return summary;
  };

  const summary = getReportSummary();

  const getDateRangeLabel = () => {
    const now = new Date();
    switch (dateRange) {
      case "today":
        return `Today (${now.toLocaleDateString()})`;
      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        return `Last Week (${weekStart.toLocaleDateString()} - ${now.toLocaleDateString()})`;
      case "month":
        const monthStart = new Date(now);
        monthStart.setMonth(now.getMonth() - 1);
        return `Last Month (${monthStart.toLocaleDateString()} - ${now.toLocaleDateString()})`;
      case "quarter":
        const quarterStart = new Date(now);
        quarterStart.setMonth(now.getMonth() - 3);
        return `Last 3 Months (${quarterStart.toLocaleDateString()} - ${now.toLocaleDateString()})`;
      case "6months":
        const sixMonthsStart = new Date(now);
        sixMonthsStart.setMonth(now.getMonth() - 6);
        return `Last 6 Months (${sixMonthsStart.toLocaleDateString()} - ${now.toLocaleDateString()})`;
      case "custom":
        if (customDateFrom && customDateTo) {
          return `Custom Range (${customDateFrom} - ${customDateTo})`;
        }
        return "Custom Range";
      default:
        return "Unknown Range";
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  const getActionName = (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    return action ? action.name : "Unknown Action";
  };

  const usersWithEmails = users.filter(u => u.email);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports & Analytics</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filters</Text>
          
          <View style={styles.filterCard}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Date Range</Text>
              <View style={styles.filterButtons}>
                {[
                  { id: "today", label: "Today" },
                  { id: "week", label: "Last Week" },
                  { id: "month", label: "Last Month" },
                  { id: "quarter", label: "Last 3 Months" },
                  { id: "6months", label: "Last 6 Months" },
                  { id: "custom", label: "Custom" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.filterButton,
                      dateRange === option.id && styles.filterButtonActive
                    ]}
                    onPress={() => setDateRange(option.id as DateRangeType)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      dateRange === option.id && styles.filterButtonTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {dateRange === "custom" && (
                <View style={styles.customDateContainer}>
                  <View style={styles.dateInputGroup}>
                    <Text style={styles.dateLabel}>From</Text>
                    <DatePicker
                      value={customDateFrom}
                      onChange={setCustomDateFrom}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                  <View style={styles.dateInputGroup}>
                    <Text style={styles.dateLabel}>To</Text>
                    <DatePicker
                      value={customDateTo}
                      onChange={setCustomDateTo}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                </View>
              )}
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Users</Text>
              <View style={styles.filterButtons}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    selectedUsers.includes("all") && styles.filterButtonActive
                  ]}
                  onPress={() => toggleUserSelection("all")}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedUsers.includes("all") && styles.filterButtonTextActive
                  ]}>
                    All Users
                  </Text>
                </TouchableOpacity>
                
                {users.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={[
                      styles.filterButton,
                      selectedUsers.includes(user.id) && styles.filterButtonActive
                    ]}
                    onPress={() => toggleUserSelection(user.id)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      selectedUsers.includes(user.id) && styles.filterButtonTextActive
                    ]}>
                      {user.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{summary.totalEntries}</Text>
                <Text style={styles.summaryLabel}>Total Actions</Text>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{summary.totalPoints}</Text>
                <Text style={styles.summaryLabel}>Total Points</Text>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {Object.keys(summary.userBreakdown).length}
                </Text>
                <Text style={styles.summaryLabel}>Active Users</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Actions</Text>
          
          <View style={styles.dataCard}>
            {Object.entries(summary.actionBreakdown)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([actionId, count]) => (
                <View key={actionId} style={styles.dataRow}>
                  <Text style={styles.dataLabel}>{getActionName(actionId)}</Text>
                  <Text style={styles.dataValue}>{count}</Text>
                </View>
              ))}
          </View>
        </View>

        {/* User Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Performance</Text>
          
          <View style={styles.dataCard}>
            {Object.entries(summary.userBreakdown)
              .sort(([,a], [,b]) => b.points - a.points)
              .map(([userId, data]) => (
                <View key={userId} style={styles.userRow}>
                  <Text style={styles.userName}>{getUserName(userId)}</Text>
                  <View style={styles.userStats}>
                    <Text style={styles.userActions}>{data.entries} actions</Text>
                    <Text style={styles.userPoints}>{data.points} pts</Text>
                  </View>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>

      {/* Export Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportCSV}>
          <Download size={16} color={Colors.secondary} />
          <Text style={styles.exportButtonText}>CSV</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
          <FileText size={16} color={Colors.secondary} />
          <Text style={styles.exportButtonText}>PDF</Text>
        </TouchableOpacity>
        
        <Button
          title="Email Report"
          onPress={handleEmailReport}
          style={styles.emailButton}
        />
      </View>

      {/* Email Report Modal */}
      <Modal
        visible={emailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEmailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Email Report</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setEmailModalVisible(false)}
                >
                  <X size={24} color={Colors.gray.medium} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.emailForm}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.emailFormContent}
              >
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>File Format</Text>
                  <View style={styles.formatButtons}>
                    <TouchableOpacity
                      style={[
                        styles.formatButton,
                        emailFormat === "pdf" && styles.formatButtonActive
                      ]}
                      onPress={() => setEmailFormat("pdf")}
                    >
                      <Text style={[
                        styles.formatButtonText,
                        emailFormat === "pdf" && styles.formatButtonTextActive
                      ]}>
                        PDF
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.formatButton,
                        emailFormat === "csv" && styles.formatButtonActive
                      ]}
                      onPress={() => setEmailFormat("csv")}
                    >
                      <Text style={[
                        styles.formatButtonText,
                        emailFormat === "csv" && styles.formatButtonTextActive
                      ]}>
                        CSV
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Send To</Text>
                  <View style={styles.emailOptions}>
                    {usersWithEmails.map((user) => (
                      <TouchableOpacity
                        key={user.id}
                        style={[
                          styles.emailOption,
                          selectedEmailUser === user.id && styles.emailOptionActive
                        ]}
                        onPress={() => setSelectedEmailUser(user.id)}
                      >
                        <Text style={[
                          styles.emailOptionText,
                          selectedEmailUser === user.id && styles.emailOptionTextActive
                        ]}>
                          {user.name} ({user.email})
                        </Text>
                      </TouchableOpacity>
                    ))}
                    
                    <TouchableOpacity
                      style={[
                        styles.emailOption,
                        selectedEmailUser === "custom" && styles.emailOptionActive
                      ]}
                      onPress={() => setSelectedEmailUser("custom")}
                    >
                      <Text style={[
                        styles.emailOptionText,
                        selectedEmailUser === "custom" && styles.emailOptionTextActive
                      ]}>
                        Custom Email
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {selectedEmailUser === "custom" && (
                    <TextInput
                      style={styles.customEmailInput}
                      value={customEmail}
                      onChangeText={setCustomEmail}
                      placeholder="Enter email address"
                      placeholderTextColor={Colors.gray.medium}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  )}
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setEmailModalVisible(false)}
                  variant="outline"
                  style={styles.cancelButton}
                />
                <Button
                  title="Send Report"
                  onPress={handleSendEmail}
                  loading={loading}
                  style={styles.sendButton}
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
  filterCard: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 12,
    padding: 16,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    backgroundColor: Colors.gray.darker,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  filterButtonActive: {
    backgroundColor: Colors.accent,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.gray.light,
  },
  filterButtonTextActive: {
    color: Colors.secondary,
  },
  customDateContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  dateInputGroup: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: 4,
  },
  dateInput: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.primary,
    height: 40,
  },
  summaryCard: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
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
  dataCard: {
    backgroundColor: Colors.gray.darkest,
    borderRadius: 12,
    padding: 16,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.darker,
  },
  dataLabel: {
    fontSize: 14,
    color: Colors.secondary,
    flex: 1,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.accent,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.darker,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
    flex: 1,
  },
  userStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userActions: {
    fontSize: 12,
    color: Colors.gray.light,
  },
  userPoints: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.accent,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 16,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray.darkest,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  exportButtonText: {
    color: Colors.secondary,
    fontWeight: "600",
    fontSize: 14,
  },
  emailButton: {
    flex: 1,
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
    maxHeight: "85%",
    minHeight: "50%",
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
  },
  closeButton: {
    padding: 4,
  },
  emailForm: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emailFormContent: {
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
  formatButtons: {
    flexDirection: "row",
    gap: 8,
  },
  formatButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.gray.darker,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  formatButtonActive: {
    backgroundColor: Colors.accent,
  },
  formatButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray.light,
  },
  formatButtonTextActive: {
    color: Colors.secondary,
  },
  emailOptions: {
    gap: 8,
  },
  emailOption: {
    backgroundColor: Colors.gray.darker,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  emailOptionActive: {
    backgroundColor: Colors.accent,
  },
  emailOptionText: {
    fontSize: 14,
    color: Colors.gray.light,
  },
  emailOptionTextActive: {
    color: Colors.secondary,
  },
  customEmailInput: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.primary,
    marginTop: 8,
    minHeight: 48,
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
  sendButton: {
    flex: 1,
  },
});