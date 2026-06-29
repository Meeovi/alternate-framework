export interface SfCompany {
  id: string;
  name: string;
  companyName: string;
  email: string;
  telephone: string;
  resellerId?: string;
  websiteId: string;
  groupId: string;
  status: "active" | "inactive" | "pending_approval" | "rejected";
  isVerified: boolean;
  verifiedAt?: string;
  creditLimit: number;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  extensionAttributes?: Record<string, unknown>;
}

export interface SfCompanyContact {
  id: string;
  companyId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  telephone?: string;
  jobTitle?: string;
  status: "active" | "inactive" | "rejected";
  resetPasswordFlag: number;
  extensionAttributes?: Record<string, unknown>;
}
