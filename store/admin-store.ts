import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { KpiAction, KpiCategory, KPI_ACTIONS, KPI_CATEGORIES } from "@/constants/kpis";

type AdminStore = {
  kpiActions: KpiAction[];
  kpiCategories: KpiCategory[];
  targets: {
    daily: number;
    weekly: number;
    monthly: number;
    effectiveDate: string;
  };
  
  // KPI Actions
  addKpiAction: (action: Omit<KpiAction, "id">) => Promise<string>;
  updateKpiAction: (actionId: string, updates: Partial<Omit<KpiAction, "id">>) => Promise<void>;
  deleteKpiAction: (actionId: string) => Promise<void>;
  
  // KPI Categories
  addKpiCategory: (category: Omit<KpiCategory, "id">) => Promise<string>;
  updateKpiCategory: (categoryId: string, updates: Partial<Omit<KpiCategory, "id">>) => Promise<void>;
  deleteKpiCategory: (categoryId: string) => Promise<void>;
  
  // Targets
  updateTargets: (targets: { daily: number; weekly: number; monthly: number; effectiveDate: string }) => Promise<void>;
  
  // Initialize with default data
  initializeDefaults: () => void;
};

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      kpiActions: [],
      kpiCategories: [],
      targets: {
        daily: 40,
        weekly: 120,
        monthly: 1000,
        effectiveDate: new Date().toISOString().split("T")[0],
      },

      initializeDefaults: () => {
        const { kpiActions, kpiCategories } = get();
        
        // Initialize with default categories if empty
        if (kpiCategories.length === 0) {
          set({ kpiCategories: [...KPI_CATEGORIES] });
        }
        
        // Initialize with default actions if empty
        if (kpiActions.length === 0) {
          set({ kpiActions: [...KPI_ACTIONS] });
        }
      },

      addKpiAction: async (actionData) => {
        const { kpiActions } = get();
        const newId = `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const newAction: KpiAction = {
          ...actionData,
          id: newId,
        };
        
        set({ kpiActions: [...kpiActions, newAction] });
        return newId;
      },

      updateKpiAction: async (actionId, updates) => {
        const { kpiActions } = get();
        const updatedActions = kpiActions.map(action => 
          action.id === actionId ? { ...action, ...updates } : action
        );
        set({ kpiActions: updatedActions });
      },

      deleteKpiAction: async (actionId) => {
        const { kpiActions } = get();
        const updatedActions = kpiActions.filter(action => action.id !== actionId);
        set({ kpiActions: updatedActions });
      },

      addKpiCategory: async (categoryData) => {
        const { kpiCategories } = get();
        const newId = `category_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const newCategory: KpiCategory = {
          ...categoryData,
          id: newId,
        };
        
        set({ kpiCategories: [...kpiCategories, newCategory] });
        return newId;
      },

      updateKpiCategory: async (categoryId, updates) => {
        const { kpiCategories, kpiActions } = get();
        
        // Update the category
        const updatedCategories = kpiCategories.map(category => 
          category.id === categoryId ? { ...category, ...updates } : category
        );
        
        // Update all actions that use this category
        const updatedActions = kpiActions.map(action => 
          action.category.id === categoryId 
            ? { ...action, category: { ...action.category, ...updates } }
            : action
        );
        
        set({ 
          kpiCategories: updatedCategories,
          kpiActions: updatedActions
        });
      },

      deleteKpiCategory: async (categoryId) => {
        const { kpiCategories } = get();
        const updatedCategories = kpiCategories.filter(category => category.id !== categoryId);
        set({ kpiCategories: updatedCategories });
      },

      updateTargets: async (newTargets) => {
        set({ targets: newTargets });
      },
    }),
    {
      name: "stadium-admin-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Initialize defaults when the store is first created
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useAdminStore.getState().initializeDefaults();
  }, 100);
}