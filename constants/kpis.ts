export type KpiAction = {
  id: string;
  name: string;
  description: string;
  points: number;
  category: KpiCategory;
};

export type KpiCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export const KPI_CATEGORIES: KpiCategory[] = [
  {
    id: "lead_generation",
    name: "Lead Generation & Conversion",
    icon: "user-plus",
    color: "#4DA6FF",
  },
  {
    id: "member_retention",
    name: "Member Retention / Happiness Maintenance",
    icon: "heart",
    color: "#4DA6FF",
  },
  {
    id: "cancellation_mitigation",
    name: "Cancellation Mitigation & Renewals",
    icon: "refresh-cw",
    color: "#4DA6FF",
  },
];

export const KPI_ACTIONS: KpiAction[] = [
  {
    id: "new_lead",
    name: "New Lead Entered",
    description: "Any new contact manually added to GymSales. Must be a valid contact.",
    points: 1,
    category: KPI_CATEGORIES[0],
  },
  {
    id: "prospect_engaged",
    name: "Prospect Engaged",
    description: "Initial contact with a prospect that shows interest.",
    points: 4,
    category: KPI_CATEGORIES[0],
  },
  {
    id: "converted_to_member",
    name: "Converted to Member",
    description: "Prospect successfully signs up for membership.",
    points: 10,
    category: KPI_CATEGORIES[0],
  },
  {
    id: "checkin_call",
    name: "Check-in Call",
    description: "Regular check-in with existing members.",
    points: 2,
    category: KPI_CATEGORIES[1],
  },
  {
    id: "successful_reengagement",
    name: "Successful Re-engagement",
    description: "Re-engaging with a member who hasn't visited recently.",
    points: 8,
    category: KPI_CATEGORIES[1],
  },
  {
    id: "renewal_before_expiry",
    name: "Renewal Before Expiry",
    description: "Member renews before their membership expires.",
    points: 6,
    category: KPI_CATEGORIES[2],
  },
  {
    id: "upsell_renewal",
    name: "Upsell Renewal",
    description: "Member upgrades their membership during renewal.",
    points: 8,
    category: KPI_CATEGORIES[2],
  },
  {
    id: "cancellation_mitigated",
    name: "Cancellation Mitigated",
    description: "Successfully prevented a member from cancelling.",
    points: 10,
    category: KPI_CATEGORIES[2],
  },
  {
    id: "transfer_executed",
    name: "Transfer Executed",
    description: "Successfully transferred a membership to another person.",
    points: 10,
    category: KPI_CATEGORIES[2],
  },
  {
    id: "exit_survey_logged",
    name: "Exit Survey Logged",
    description: "Completed exit survey for a cancelled membership.",
    points: 2,
    category: KPI_CATEGORIES[2],
  },
];

export const DAILY_TARGET = 40;
export const WEEKLY_TARGET = 120;
export const TEAM_MONTHLY_TARGET = 1000;