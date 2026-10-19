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

export const INITIAL_PEOPLE: PersonItem[] = [
  {
    id: "per-1",
    fullName: "Dan Omondi",
    primaryTitle: "Managing Director & Head Mechanic",
    email: "dan@safariauto.co.ke",
    phone: "+254 722 100 200",
    whatsApp: "+254 722 100 200",
    primaryOrganizationId: "org-1",
    primaryOrganizationName: "Safari Auto Clinic",
    productInterests: ["Vehisoft"],
    relationships: [
      {
        organizationId: "org-1",
        organizationName: "Safari Auto Clinic",
        relationshipType: "Decision Maker",
        context: "Authorized 12-month Vehisoft implementation & paid KES 35,000 setup fee.",
      },
      {
        organizationId: "org-assoc-garages",
        organizationName: "Nairobi Automotive Technicians Alliance",
        relationshipType: "Partner",
        context: "Treasurer of the alliance; provides referral introductions to 14 affiliated workshops in Industrial Area.",
      },
    ],
    tags: ["VIP Client", "Referral Partner", "Garages"],
    lastContacted: "Today 11:15 AM",
    notes: "Prefers phone calls over email. Very responsive on WhatsApp during morning workshop opening (8-9 AM).",
  },
  {
    id: "per-2",
    fullName: "James Mwangi",
    primaryTitle: "Workshop General Manager",
    email: "james@apexauto.co.ke",
    phone: "+254 721 345 678",
    whatsApp: "+254 721 345 678",
    primaryOrganizationId: "org-apex",
    primaryOrganizationName: "Apex Auto Garage (Industrial Area)",
    productInterests: ["Vehisoft"],
    relationships: [
      {
        organizationId: "org-apex",
        organizationName: "Apex Auto Garage",
        relationshipType: "Decision Maker",
        context: "Evaluating digital job cards and parts leakage prevention demo.",
      },
      {
        organizationId: "org-apex-parts",
        organizationName: "Apex Spare Parts Retail",
        relationshipType: "Technical Lead",
        context: "Manages over-the-counter spare parts counter sales.",
      },
    ],
    tags: ["High-Value Lead", "Industrial Area", "Walk-in Target"],
    lastContacted: "Today 10:30 AM",
    notes: "Walk-in demonstration scheduled. Wants to see inventory barcode lookup speeds.",
  },
  {
    id: "per-3",
    fullName: "Grace Wanjiku",
    primaryTitle: "Proprietor & Operations Director",
    email: "grace@expresswash.co.ke",
    phone: "+254 722 990 123",
    whatsApp: "+254 722 990 123",
    primaryOrganizationId: "org-express",
    primaryOrganizationName: "Express Wash Kilimani",
    productInterests: ["Versandry"],
    relationships: [
      {
        organizationId: "org-express",
        organizationName: "Express Wash Kilimani",
        relationshipType: "Decision Maker",
        context: "Founding client for Versandry laundry POS & automated pickup notifications.",
      },
      {
        organizationId: "org-express-lavington",
        organizationName: "Express Dry Cleaners (Lavington Branch)",
        relationshipType: "Client Contact",
        context: "Opening 2nd satellite collection branch in Q1; planned multi-branch license add-on.",
      },
    ],
    tags: ["Active Client", "Laundromat", "Multi-Location"],
    lastContacted: "Yesterday 4:20 PM",
    notes: "Delighted with the WhatsApp driver dispatch test. Preparing thermal printer installation.",
  },
  {
    id: "per-4",
    fullName: "Peter Ochieng",
    primaryTitle: "Managing Director",
    email: "ochieng@skylineoutdoor.co.ke",
    phone: "+254 701 555 777",
    whatsApp: "+254 701 555 777",
    primaryOrganizationId: "org-skyline",
    primaryOrganizationName: "Skyline Outdoor Media Ltd",
    productInterests: ["Adversoft"],
    relationships: [
      {
        organizationId: "org-skyline",
        organizationName: "Skyline Outdoor Media Ltd",
        relationshipType: "Decision Maker",
        context: "Signed 12-month master contract for 18 billboard sites across Nairobi & Mombasa highway.",
      },
    ],
    tags: ["High ACV", "Active Client", "Signage"],
    lastContacted: "2 days ago",
    notes: "Needs KRA/eTIMS compliant tax invoice for quarterly finance filings.",
  },
  {
    id: "per-5",
    fullName: "Chef Dennis",
    primaryTitle: "Executive Chef & Co-Owner",
    email: "dennis@urbanplate.co.ke",
    phone: "+254 711 902 345",
    whatsApp: "+254 711 902 345",
    primaryOrganizationId: "org-urban",
    primaryOrganizationName: "Urban Plate Bistro (Westlands)",
    productInterests: ["Melio RMS"],
    relationships: [
      {
        organizationId: "org-urban",
        organizationName: "Urban Plate Bistro",
        relationshipType: "Decision Maker",
        context: "Evaluating Melio RMS table ordering to replace slow manual kitchen slips.",
      },
      {
        organizationId: "org-urban-catering",
        organizationName: "Urban Plate Corporate Catering",
        relationshipType: "Previous Lead",
        context: "Looked at invoice billing earlier this year.",
      },
    ],
    tags: ["Hospitality", "Active Opportunity", "Demo Stage"],
    lastContacted: "Today 2:00 PM",
    notes: "Expressed concern about kitchen tablet durability. Showed him our shockproof silicone rubber case demos.",
  },
  {
    id: "per-6",
    fullName: "Faith Kimani",
    primaryTitle: "Property Portfolio Manager",
    email: "faith@grandview.co.ke",
    phone: "+254 701 333 222",
    whatsApp: "+254 701 333 222",
    primaryOrganizationId: "org-grandview",
    primaryOrganizationName: "Grandview Luxury Apartments",
    productInterests: ["LipaTim"],
    relationships: [
      {
        organizationId: "org-grandview",
        organizationName: "Grandview Luxury Apartments",
        relationshipType: "Decision Maker",
        context: "Received LipaTim automated rent billing proposal for 64 residential units in Kileleshwa.",
      },
      {
        organizationId: "org-kimani-properties",
        organizationName: "Kimani Real Estate Agency",
        relationshipType: "Partner",
        context: "Director of family management firm handling 3 additional apartment blocks.",
      },
    ],
    tags: ["Real Estate", "Fintech Lead", "Expansion Potential"],
    lastContacted: "3 days ago",
    notes: "Awaiting board sign-off on setup fee. Landlord wants zero manual bank reconciliation.",
  },
];
