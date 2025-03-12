"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

interface UserButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  showName?: boolean;
}

export function UserButton({ 
  showName = false, 
  className,
  variant = "ghost",
  ...props 
}: UserButtonProps) {
  const { user } = useKindeBrowserClient();
  
  const displayName = user?.given_name 
    ? `${user.given_name} ${user.family_name || ''}`
    : user?.email || 'Account';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={showName ? "default" : "icon"}
          className={cn(
            showName && "flex items-center gap-2 px-3",
            className
          )}
          {...props}
        >
          <SimpleIcon name="user" size={20} />
          {showName && <span className="truncate">{displayName}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {user?.email && (
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogoutLink className="w-full cursor-pointer">Log out</LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 