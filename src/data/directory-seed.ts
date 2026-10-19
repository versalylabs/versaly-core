export interface DirectoryPerson {
  id: string;
  organizationId?: string;
  organizationName?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  jobTitle: string;
  contactType: "PRIMARY" | "DECISION_MAKER" | "BILLING" | "TECHNICAL" | "OPERATIONAL";
  notes?: string;
}

export interface DirectoryActivity {
  id: string;
  type: "CALL" | "VISIT" | "WHATSAPP" | "EMAIL" | "MEETING" | "NOTE";
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface DirectoryOrganization {
  id: string;
  name: string;
  type: "CLIENT" | "PROSPECT" | "PARTNER" | "VENDOR";
  industry: string;
  productFit: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  taxPin?: string;
  status: "ACTIVE" | "PENDING_SETUP" | "ENGAGED";
  contacts: DirectoryPerson[];
  activities: DirectoryActivity[];
}

export const DIRECTORY_ORGANIZATIONS: DirectoryOrganization[] = [];
