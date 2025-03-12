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
 * Site data structure used across components
 */
export interface SiteData {
  id: string;
  name: string;
  description: string | null;
  language: string;
  email: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  subdirectory: string;
  siteImageCover: string | null;
  logoImage: string | null;
  customDomain: string | null;
  domainVerified: boolean;
}

/**
 * Tab item for settings tabs
 */
export interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  variant?: "default" | "destructive";
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
 * Props shared across step components
 */
export interface StepBaseProps {
  fields: any; // Form fields from conform
}

/**
 * Props for the BasicsStep component
 */
export interface BasicsStepProps extends StepBaseProps {
  goToNextStep: (e?: React.MouseEvent) => void;
  formValues: SiteFormValues;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

/**
 * Props for the BrandingStep component
 */
export interface BrandingStepProps extends StepBaseProps {
  siteImageCover: string;
  setSiteImageCover: (url: string) => void;
  logoImage: string;
  setLogoImage: (url: string) => void;
  goToNextStep: (e?: React.MouseEvent) => void;
  goToPrevStep: (e?: React.MouseEvent) => void;
}

/**
 * Props for the SocialStep component
 */
export interface SocialStepProps extends StepBaseProps {
  goToPrevStep: (e?: React.MouseEvent) => void;
  formValues: SiteFormValues;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

/**
 * Props for the StepIndicator component
 */
export interface StepIndicatorProps {
  steps: StepName[];
  activeIndex: number;
  handleStepChange: (value: StepName) => void;
}

/**
 * Props for the SettingsTabs component
 */
export interface SettingsTabsProps {
  site: SiteData;
}

/**
 * Props for the AppearanceTab component
 */
export interface AppearanceTabProps {
  siteId: string;
  site?: {
    siteImageCover: string | null;
    logoImage: string | null;
  };
}

/**
 * Props for the DomainTab component
 */
export interface DomainTabProps {
  siteId: string;
  site?: {
    siteName?: string;
    customDomain?: string;
    domainVerified?: boolean;
  };
}

/**
 * Props for the DangerTab component
 */
export interface DangerTabProps {
  siteId: string;
  site?: {
    siteName?: string;
  };
}

/**
 * Props for the DeleteBlogTab component
 */
export interface DeleteBlogTabProps {
  siteId: string;
  siteName: string;
}

/**
 * Props for the GeneralTab component
 */
export interface GeneralTabProps {
  site: SiteData;
}

/**
 * Props for the UpdateSiteForm component
 */
export interface UpdateSiteFormProps {
  site: SiteData;
}

/**
 * Props for the DeleteSiteClient component
 */
export interface DeleteSiteProps {
  siteId: string;
  siteName: string;
} 