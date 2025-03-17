import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

import { UserButton } from "@/app/components/dashboard/UserButton";
import globe from "@/public/globe.svg";

import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import { DashboardItems } from "../components/dashboard/DashboardItems";
import { ThemeToggle } from "../components/dashboard/ThemeToggle";

export const navLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: ({ className }: { className?: string }) => <SimpleIcon name="home" className={className} />,
  },
  {
    name: "Sites",
    href: "/dashboard/sites",
    icon: ({ className }: { className?: string }) => <SimpleIcon name="globe" className={className} />,
  },
  {
    name: "Pricing",
    href: "/dashboard/pricing",
    icon: ({ className }: { className?: string }) => <SimpleIcon name="dollarsign" className={className} />,
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile Header - Sticky */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <SimpleIcon name="menu" size={20} />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[220px] pr-0 sm:w-[240px]">
            <div className="flex h-full flex-col">
              <div className="flex h-14 items-center px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <Image src={globe} alt="Logo" className="size-6" priority />
                  <h3 className="text-xl">
                    Blog<span className="text-primary">Stack</span>
                  </h3>
                </Link>
              </div>
              <nav className="grid flex-1 items-start px-2 pt-4 font-medium">
                <DashboardItems />
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image src={globe} alt="Logo" className="size-6" priority />
          <h3 className="text-xl">
            Blog<span className="text-primary">Stack</span>
          </h3>
        </Link>

        <div className="ml-auto flex items-center gap-x-4">
          <ThemeToggle />
          <UserButton />
        </div>
      </header>

      {/* Empty space to compensate for fixed header on mobile */}
      <div className="h-16 md:hidden" />

      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block">
          <div className="fixed inset-y-0 left-0 flex h-screen w-[200px] flex-col border-r bg-muted/40 lg:w-[220px]">
            <div className="flex h-16 items-center border-b px-4">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Image src={globe} alt="Logo" className="size-6" priority />
                <h3 className="text-lg">
                  Blog<span className="text-primary">Stack</span>
                </h3>
              </Link>
            </div>

            <div className="scrollbar-thin flex-1 overflow-y-auto py-2">
              <nav className="grid items-start px-3 font-medium">
                <DashboardItems />
              </nav>
            </div>

            <div className="border-t p-3">
              <UserButton variant="secondary" className="w-full justify-start px-2 text-sm" showName />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex flex-1 flex-col md:ml-[200px] lg:ml-[220px]">
          {/* Desktop Header - Fixed */}
          <header className="fixed right-0 top-0 z-30 hidden h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:left-[200px] md:flex lg:left-[220px]">
            <div className="ml-auto flex items-center gap-x-4 px-6">
              <ThemeToggle />
              <UserButton variant="secondary" />
            </div>
          </header>

          {/* Empty space to compensate for fixed header on desktop */}
          <div className="hidden h-16 md:block" />

          {/* Page Content */}
          <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
