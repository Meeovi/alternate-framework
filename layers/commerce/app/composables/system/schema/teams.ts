export interface SfTeam {
  id: string;
  companyId: string;
  name: string;
  description: string;
  sortOrder: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  extensionAttributes?: Record<string, unknown>;
}
