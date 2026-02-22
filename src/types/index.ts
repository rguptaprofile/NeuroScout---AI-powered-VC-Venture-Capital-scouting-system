export type CompanySignal = {
  date: string;
  label: string;
  detail: string;
};

export type Company = {
  id: string;
  name: string;
  website: string;
  description: string;
  tags: string[];
  location: string;
  stage: string;
  sector: string;
  founded: number;
  employees: string;
  lastSignalAt: string;
  signals: CompanySignal[];
};

export type EnrichmentResult = {
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  derivedSignals: string[];
  sources: { url: string; fetchedAt: string }[];
};

export type SavedSearch = {
  id: string;
  name: string;
  query: string;
  filters: {
    stage?: string;
    sector?: string;
    location?: string;
    tag?: string;
  };
  createdAt: string;
};

export type CompanyList = {
  id: string;
  name: string;
  companyIds: string[];
  createdAt: string;
};
