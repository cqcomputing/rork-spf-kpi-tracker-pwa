import { useMemo } from "react";
import { useAdminStore } from "@/store/admin-store";
import { KPI_ACTIONS, KPI_CATEGORIES } from "@/constants/kpis";

/**
 * Hook that provides the current KPI actions and categories
 * Prioritizes admin store data, falls back to constants
 */
export const useKpiData = () => {
  const { kpiActions, kpiCategories } = useAdminStore();
  
  const categories = useMemo(() => {
    return kpiCategories.length > 0 ? kpiCategories : KPI_CATEGORIES;
  }, [kpiCategories]);
  
  const actions = useMemo(() => {
    return kpiActions.length > 0 ? kpiActions : KPI_ACTIONS;
  }, [kpiActions]);
  
  const getActionById = useMemo(() => {
    return (actionId: string) => {
      return actions.find(action => action.id === actionId);
    };
  }, [actions]);
  
  const getCategoryById = useMemo(() => {
    return (categoryId: string) => {
      return categories.find(category => category.id === categoryId);
    };
  }, [categories]);
  
  const getActionsByCategory = useMemo(() => {
    const actionsByCategory: Record<string, typeof actions> = {};
    
    categories.forEach(category => {
      actionsByCategory[category.id] = actions.filter(
        action => action.category.id === category.id
      );
    });
    
    return actionsByCategory;
  }, [actions, categories]);
  
  return {
    categories,
    actions,
    getActionById,
    getCategoryById,
    getActionsByCategory,
  };
};