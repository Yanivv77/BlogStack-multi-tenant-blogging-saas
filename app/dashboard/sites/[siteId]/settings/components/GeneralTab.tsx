"use client";

import { UpdateSiteForm } from "../UpdateSiteForm";

type GeneralTabProps = {
  site: {
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
  };
};

export function GeneralTab({ site }: GeneralTabProps) {
  return (
    <div className="space-y-6">
      <UpdateSiteForm site={site} />
    </div>
  );
} 