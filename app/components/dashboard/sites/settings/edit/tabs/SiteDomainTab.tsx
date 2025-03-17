"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { DomainTabProps } from "@/app/components/dashboard/sites/utils/types";

/**
 * Tab component for managing site domain settings
 */
export function SiteDomainTab({ siteId, site }: DomainTabProps) {
  const defaultDomain = `${site?.siteName?.toLowerCase().replace(/\s+/g, "-")}.blogstack.io`;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-foreground">Domain Settings</h3>
        <p className="text-sm text-muted-foreground">Configure how visitors access your site</p>
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
              <Input value={defaultDomain} readOnly className="bg-muted/50 font-mono text-sm" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  window.open(`https://${defaultDomain}`, "_blank");
                }}
                title="Visit site"
              >
                <SimpleIcon name="externallink" size={16} />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">This domain is always available and cannot be changed</p>
          </CardContent>
        </Card>

        {/* Custom Domain Card - Coming Soon */}
        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                Custom Domain
                <Badge className="ml-2 flex items-center gap-1 bg-primary/20 text-primary hover:bg-primary/30">
                  <SimpleIcon name="clock" size={12} />
                  Coming Soon
                </Badge>
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">Connect your own domain to your site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-primary/20 bg-primary/10 p-4">
              <div className="flex gap-3">
                <SimpleIcon name="sparkles" size={20} className="flex-shrink-0 text-primary" />
                <div>
                  <h4 className="mb-1 font-medium text-foreground">Custom domain support coming soon!</h4>
                  <p className="text-sm text-muted-foreground">
                    We're working on adding support for custom domains. Soon you'll be able to connect your own domain
                    to your BlogStack site.
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <p className="text-sm text-muted-foreground">Use your own domain (e.g., yourbrand.com)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <p className="text-sm text-muted-foreground">Automatic SSL certificate setup</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <p className="text-sm text-muted-foreground">Simple DNS configuration</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="customDomain" className="text-muted-foreground">
                Domain Name
              </Label>
              <div className="mt-1.5 flex items-center gap-2">
                <Input
                  id="customDomain"
                  placeholder="yourdomain.com"
                  disabled
                  className="bg-muted/50 font-mono text-sm text-muted-foreground"
                />
                <Button variant="outline" size="default" disabled>
                  Save
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">This feature will be available in an upcoming update</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
