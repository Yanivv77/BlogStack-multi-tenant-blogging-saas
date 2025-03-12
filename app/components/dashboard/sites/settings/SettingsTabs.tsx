"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

// Import components from index file
import { 
  SiteGeneralTab, 
  SiteAppearanceTab, 
  SiteDomainTab, 
  SiteDangerTab 
} from "../settings/edit/tabs";

// Import shared types
import { SiteData, TabItem, SettingsTabsProps } from "../utils/types";

// CSS for hiding scrollbar while allowing scrolling
const hideScrollbarStyle = `
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;     /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;             /* Chrome, Safari and Opera */
  }
`;

export function SettingsTabs({ site }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState("general");
  
  const tabs: TabItem[] = [
    {
      id: "general",
      label: "General",
      icon: <SimpleIcon name="settings" size={16} />,
      content: <SiteGeneralTab site={site} />,
      variant: "default"
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <SimpleIcon name="image" size={16} />,
      content: (
        <SiteAppearanceTab 
          siteId={site.id} 
          site={{
            siteImageCover: site.siteImageCover,
            logoImage: site.logoImage
          }}
        />
      ),
      variant: "default"
    },
    {
      id: "domain",
      label: "Domain",
      icon: <SimpleIcon name="globe" size={16} />,
      content: (
        <SiteDomainTab 
          siteId={site.id} 
          site={{
            siteName: site.name,
            customDomain: site.customDomain || undefined,
            domainVerified: site.domainVerified
          }}
        />
      ),
      variant: "default"
    },
    {
      id: "danger",
      label: "Danger Zone",
      icon: <SimpleIcon name="x" size={16} className="text-destructive" />,
      content: (
        <SiteDangerTab 
          siteId={site.id} 
          site={{
            siteName: site.name
          }}
        />
      ),
      variant: "destructive"
    }
  ];
  
  return (
    <div className="flex flex-col gap-6">
      {/* Add style for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: hideScrollbarStyle }} />
      
      {/* Top Tabs Navigation */}
      <nav className="w-full border-b border-border/10" aria-label="Settings tabs">
        <div className="flex w-full">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center justify-center gap-2.5 px-5 py-2.5 text-sm font-medium transition-all duration-150",
                "rounded-md border-0",
                index > 0 && "ml-2",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-secondary/25",
                activeTab === tab.id
                  ? cn(
                      tab.variant === "destructive"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-secondary/50 text-secondary-foreground"
                    )
                  : cn(
                      "bg-transparent hover:bg-secondary/30",
                      tab.variant === "destructive"
                        ? "text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        : "text-muted-foreground hover:text-secondary-foreground"
                    )
              )}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              <span className={cn(
                "flex-shrink-0",
                tab.variant === "destructive" 
                  ? "text-destructive/90" 
                  : activeTab === tab.id 
                    ? "text-secondary-foreground" 
                    : "text-muted-foreground"
              )}>
                {tab.icon}
              </span>
              <span>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
      
      {/* Content Area with better padding */}
      <div className="flex-1 min-w-0">
        <Tabs value={activeTab} className="w-full">
          {tabs.map((tab) => (
            <TabsContent 
              key={tab.id} 
              value={tab.id} 
              className="m-0 pt-4 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="focus:outline-none"
              >
                <div className="rounded-lg">
                  {tab.content}
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
} 