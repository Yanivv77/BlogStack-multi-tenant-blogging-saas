"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { DomainTabProps } from "@/app/components/dashboard/sites/utils/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Tab component for managing site domain settings
 */
export function SiteDomainTab({ siteId, site }: DomainTabProps) {
  const defaultDomain = `${site?.siteName?.toLowerCase().replace(/\s+/g, "-")}.blogstack.io`;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-foreground">Domain Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure how visitors access your site
        </p>
      </div>
      
      <div className="grid gap-6">
        {/* Default Domain Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Default Domain</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your site's automatically generated domain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input 
                value={defaultDomain}
                readOnly
                className="font-mono text-sm bg-muted/50"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  window.open(`https://${defaultDomain}`, '_blank');
                }}
                title="Visit site"
              >
                <SimpleIcon name="externallink" size={16} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This domain is always available and cannot be changed
            </p>
          </CardContent>
        </Card>
        
        {/* Custom Domain Card - Coming Soon */}
        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                Custom Domain
                <Badge 
                  className="bg-primary/20 text-primary hover:bg-primary/30 flex items-center gap-1 ml-2"
                >
                  <SimpleIcon name="clock" size={12} />
                  Coming Soon
                </Badge>
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Connect your own domain to your site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-primary/10 p-4 border border-primary/20">
              <div className="flex gap-3">
                <SimpleIcon name="sparkles" size={20} className="text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Custom domain support coming soon!</h4>
                  <p className="text-sm text-muted-foreground">
                    We're working on adding support for custom domains. Soon you'll be able to connect your own domain to your BlogStack site.
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <p className="text-sm text-muted-foreground">Use your own domain (e.g., yourbrand.com)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <p className="text-sm text-muted-foreground">Automatic SSL certificate setup</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <p className="text-sm text-muted-foreground">Simple DNS configuration</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="customDomain" className="text-muted-foreground">Domain Name</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input
                  id="customDomain"
                  placeholder="yourdomain.com"
                  disabled
                  className="font-mono text-sm bg-muted/50 text-muted-foreground"
                />
                <Button
                  variant="outline"
                  size="default"
                  disabled
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This feature will be available in an upcoming update
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 