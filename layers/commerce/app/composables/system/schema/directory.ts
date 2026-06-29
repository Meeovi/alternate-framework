export interface SfDirectoryEntry {
  id: string;
  type: string;
  url: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface SfDirectoryCountry {
  id: string;
  countryId: string;
  fullNameLocales: Record<string, string>;
  fullNameStoreViews: Record<string, string>;
  availableRegions: Array<{
    id: string;
    code: string;
    countryId: string;
    name: string;
  }>;
}

export interface SfDirectoryRegion {
  id: string;
  regionId: string;
  countryId: string;
  code: string;
  name: string;
}
