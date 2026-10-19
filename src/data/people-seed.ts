export type RelationshipType = "Decision Maker" | "Client Contact" | "Technical Lead" | "Partner" | "Previous Lead" | "Supplier" | "Champion";

export interface PersonRelationship {
  organizationId: string;
  organizationName: string;
  relationshipType: RelationshipType;
  context: string;
}

export interface PersonItem {
  id: string;
  fullName: string;
  primaryTitle: string;
  email: string;
  phone: string;
  whatsApp: string;
  primaryOrganizationId: string;
  primaryOrganizationName: string;
  productInterests: string[];
  relationships: PersonRelationship[];
  tags: string[];
  lastContacted: string;
  notes: string;
}

export const INITIAL_PEOPLE: PersonItem[] = [];
