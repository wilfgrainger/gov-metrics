export interface SectionItem {
  id: string;
  label: string;
  shortLabel?: string;
}

export interface CategoryGroup {
  category: string;
  sections: SectionItem[];
}

export const SECTIONS: CategoryGroup[] = [
  {
    category: "POLITICS",
    sections: [
      { id: "pm-approval", label: "PM APPROVAL RATING", shortLabel: "PM APPROVAL" },
      { id: "election-polls", label: "ELECTION POLLING", shortLabel: "POLLING" },
      { id: "betting-odds", label: "BETTING ODDS" },
      { id: "govt-approval", label: "GOVERNMENT APPROVAL", shortLabel: "GOVT APPROVAL" },
      { id: "gov-trust-trend", label: "TRUST IN GOVERNMENT", shortLabel: "TRUST TREND" },
    ],
  },
  {
    category: "ECONOMY",
    sections: [
      { id: "national-debt", label: "NATIONAL DEBT" },
      { id: "gdp", label: "GDP" },
      { id: "economy", label: "KEY INDICATORS", shortLabel: "INDICATORS" },
      { id: "tax", label: "TAX REVENUE", shortLabel: "TAX" },
      { id: "employment", label: "EMPLOYMENT" },
    ],
  },
  {
    category: "SOCIETY",
    sections: [
      { id: "crime-stats", label: "CRIME STATISTICS", shortLabel: "CRIME" },
      { id: "nhs", label: "NHS & HEALTH" },
      { id: "migration", label: "MIGRATION" },
    ],
  },
  {
    category: "DATA",
    sections: [
      { id: "uk-regions", label: "UK REGIONS" },
      { id: "policy-links", label: "POLICY LINKS" },
      { id: "political-compass", label: "POLITICAL COMPASS", shortLabel: "COMPASS QUIZ" },
    ],
  },
];
