import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { KpiEntry, KpiState, KpiSummary } from "@/types/kpi";
import { DAILY_TARGET, WEEKLY_TARGET, TEAM_MONTHLY_TARGET } from "@/constants/kpis";
import { useAuthStore } from "./auth-store";
import { useAdminStore } from "./admin-store";

// Helper functions
const getCurrentDate = () => {
  const date = new Date();
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

const getWeekDates = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate the date of Monday (start of week)
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - day + (day === 0 ? -6 : 1)); // If Sunday, go back to previous Monday
  
  // Calculate the date of Sunday (end of week)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

const getCurrentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

type KpiStore = KpiState & {
  setActionQuantity: (actionId: string, quantity: number) => void;
  submitActions: () => void;
  calculateSummary: () => void;
  resetSelectedActions: () => void;
  getPointsForAction: (actionId: string) => number;
  getDailyProgress: () => { current: number; target: number; percentage: number };
  getWeeklyProgress: () => { current: number; target: number; percentage: number };
  getTeamMonthlyProgress: () => { current: number; target: number; percentage: number };
};

const initialSummary: KpiSummary = {
  daily: {
    date: getCurrentDate(),
    total: 0,
    actions: {},
  },
  weekly: {
    ...getWeekDates(),
    total: 0,
    actions: {},
  },
  teamMonthly: {
    month: getCurrentMonth(),
    total: 0,
  },
};

export const useKpiStore = create<KpiStore>()(
  persist(
    (set, get) => ({
      entries: [],
      selectedActions: {}, // Now stores actionId -> quantity
      summary: initialSummary,
      
      setActionQuantity: (actionId: string, quantity: number) => {
        const { selectedActions } = get();
        if (quantity <= 0) {
          const newActions = { ...selectedActions };
          delete newActions[actionId];
          set({ selectedActions: newActions });
        } else {
          set({ selectedActions: { ...selectedActions, [actionId]: quantity } });
        }
      },
      
      submitActions: () => {
        const { selectedActions, entries } = get();
        const user = useAuthStore.getState().user;
        
        if (!user || Object.keys(selectedActions).length === 0) return;
        
        const now = new Date();
        const newEntries: KpiEntry[] = [];
        
        // Create entries for each quantity
        Object.entries(selectedActions).forEach(([actionId, quantity]) => {
          for (let i = 0; i < quantity; i++) {
            newEntries.push({
              id: `${actionId}-${now.getTime()}-${i}-${Math.random().toString(36).substring(2, 9)}`,
              userId: user.id,
              actionId,
              timestamp: now.toISOString(),
              date: getCurrentDate(),
            });
          }
        });
        
        set({ entries: [...entries, ...newEntries] });
        get().resetSelectedActions();
        // Calculate summary after submitting actions
        get().calculateSummary();
      },
      
      resetSelectedActions: () => {
        set({ selectedActions: {} });
      },
      
      calculateSummary: () => {
        const { entries } = get();
        const user = useAuthStore.getState().user;
        
        if (!user) return;
        
        const today = getCurrentDate();
        const { startDate, endDate } = getWeekDates();
        const currentMonth = getCurrentMonth();
        
        // Filter entries for current user
        const userEntries = entries.filter(entry => entry.userId === user.id);
        
        // Calculate daily summary
        const todayEntries = userEntries.filter(entry => entry.date === today);
        const dailyActions: Record<string, number> = {};
        let dailyTotal = 0;
        
        todayEntries.forEach(entry => {
          dailyActions[entry.actionId] = (dailyActions[entry.actionId] || 0) + 1;
          dailyTotal += get().getPointsForAction(entry.actionId);
        });
        
        // Calculate weekly summary
        const weekEntries = userEntries.filter(
          entry => entry.date >= startDate && entry.date <= endDate
        );
        const weeklyActions: Record<string, number> = {};
        let weeklyTotal = 0;
        
        weekEntries.forEach(entry => {
          weeklyActions[entry.actionId] = (weeklyActions[entry.actionId] || 0) + 1;
          weeklyTotal += get().getPointsForAction(entry.actionId);
        });
        
        // Calculate team monthly total (simplified for demo)
        // In a real app, this would aggregate data from all users
        const monthEntries = entries.filter(
          entry => entry.date.startsWith(currentMonth.substring(0, 7))
        );
        let teamMonthlyTotal = 0;
        
        monthEntries.forEach(entry => {
          teamMonthlyTotal += get().getPointsForAction(entry.actionId);
        });
        
        const newSummary = {
          daily: {
            date: today,
            total: dailyTotal,
            actions: dailyActions,
          },
          weekly: {
            startDate,
            endDate,
            total: weeklyTotal,
            actions: weeklyActions,
          },
          teamMonthly: {
            month: currentMonth,
            total: teamMonthlyTotal,
          },
        };
        
        set({ summary: newSummary });
      },
      
      getPointsForAction: (actionId: string) => {
        // Get current actions from admin store or fallback to constants
        const adminStore = useAdminStore.getState();
        const actions = adminStore.kpiActions.length > 0 
          ? adminStore.kpiActions 
          : require("@/constants/kpis").KPI_ACTIONS;
        
        const action = actions.find((a: any) => a.id === actionId);
        return action ? action.points : 0;
      },
      
      getDailyProgress: () => {
        const { summary } = get();
        const adminStore = useAdminStore.getState();
        const current = summary.daily.total;
        const target = adminStore.targets.daily || DAILY_TARGET;
        const percentage = Math.min(100, Math.round((current / target) * 100));
        return { current, target, percentage };
      },
      
      getWeeklyProgress: () => {
        const { summary } = get();
        const adminStore = useAdminStore.getState();
        const current = summary.weekly.total;
        const target = adminStore.targets.weekly || WEEKLY_TARGET;
        const percentage = Math.min(100, Math.round((current / target) * 100));
        return { current, target, percentage };
      },
      
      getTeamMonthlyProgress: () => {
        const { summary } = get();
        const adminStore = useAdminStore.getState();
        const current = summary.teamMonthly.total;
        const target = adminStore.targets.monthly || TEAM_MONTHLY_TARGET;
        const percentage = Math.min(100, Math.round((current / target) * 100));
        return { current, target, percentage };
      },
    }),
    {
      name: "stadium-kpi-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        entries: state.entries,
        summary: state.summary,
      }),
    }
  )
);