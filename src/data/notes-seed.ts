export interface RandomNote {
  id: string;
  title: string;
  content: string;
  category: "General" | "Idea" | "Meeting" | "Technical" | "Finance" | "Action Item";
  color: "slate" | "indigo" | "emerald" | "amber" | "rose" | "violet";
  pinned: boolean;
  linkedProjectId?: string; // e.g. "proj-safari" or empty
  linkedProjectName?: string; // e.g. "Safari Auto Clinic - Vehisoft"
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_RANDOM_NOTES: RandomNote[] = [];
