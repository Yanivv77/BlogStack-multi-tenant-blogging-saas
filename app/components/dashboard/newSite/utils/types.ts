/**
 * Common types used across the newSite components
 */

/**
 * Form values for site creation
 */
export interface SiteFormValues {
  name: string;
  subdirectory: string;
  description: string;
  language: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  siteImageCover?: string;
  logoImage?: string;
}

/**
 * Subdirectory validation status
 */
export type SubdirectoryStatus = "checking" | "available" | "unavailable" | "invalid" | null;

/**
 * Step names for the multi-step form
 */
export type StepName = "basics" | "branding" | "social" | "summary";

/**
 * Props shared across tab components
 */
export interface TabBaseProps {
  fields: any; // Form fields from conform
}

/**
 * Props for the BasicsTab component
 */
export interface BasicsTabProps extends TabBaseProps {
  goToNextTab: (e?: React.MouseEvent) => void;
  formValues: SiteFormValues;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

/**
 * Props for the BrandingTab component
 */
export interface BrandingTabProps extends TabBaseProps {
  siteImageCover: string;
  setSiteImageCover: (url: string) => void;
  logoImage: string;
  setLogoImage: (url: string) => void;
  goToNextTab: (e?: React.MouseEvent) => void;
  goToPrevTab: (e?: React.MouseEvent) => void;
}

/**
 * Props for the SocialTab component
 */
export interface SocialTabProps extends TabBaseProps {
  goToPrevTab: (e?: React.MouseEvent) => void;
  formValues: SiteFormValues;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

/**
 * Props for the StepIndicator component
 */
export interface StepIndicatorProps {
  steps: StepName[];
  activeIndex: number;
  handleTabChange: (value: StepName) => void;
} 