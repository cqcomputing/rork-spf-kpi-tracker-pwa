import { KpiAction } from "@/constants/kpis";

export type KpiEntry = {
  id: string;
  userId: string;
  actionId: string;
  timestamp: string;
  date: string; // YYYY-MM-DD format for easier grouping
  notes?: string; // Optional notes field
};

export type KpiSummary = {
  daily: {
    date: string;
    total: number;
    actions: Record<string, number>; // actionId -> count
  };
  weekly: {
    startDate: string;
    endDate: string;
    total: number;
    actions: Record<string, number>; // actionId -> count
  };
  teamMonthly: {
    month: string; // YYYY-MM format
    total: number;
  };
};

export type KpiState = {
  entries: KpiEntry[];
  selectedActions: Record<string, number>; // actionId -> quantity
  summary: KpiSummary;
};