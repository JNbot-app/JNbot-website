// Parse license data from JSON format
export interface LicenseInfo {
  licenses: string;
  repository?: string;
  publisher?: string;
  email?: string;
  url?: string;
}

export interface LicenseData {
  [packageName: string]: LicenseInfo;
}

export function parseLicenseData(jsonData: string): LicenseData {
  try {
    return JSON.parse(jsonData) as LicenseData;
  } catch (error) {
    console.error("Failed to parse license data:", error);
    return {};
  }
}

export function getLicenseGroups(data: LicenseData): { [letter: string]: string[] } {
  const groups: { [letter: string]: string[] } = {};
  
  // Create alphabetical groups
  Object.keys(data).sort().forEach(packageName => {
    const firstChar = packageName.charAt(0).toUpperCase();
    if (!groups[firstChar]) {
      groups[firstChar] = [];
    }
    groups[firstChar].push(packageName);
  });
  
  return groups;
}