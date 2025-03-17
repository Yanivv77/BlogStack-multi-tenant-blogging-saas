import Link from "next/link";

import { LoginLink, LogoutLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { Button } from "@/components/ui/button";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

export default async function Home() {
  const { getUser } = getKindeServerSession();
  const session = await getUser();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="border-b border-border">
        <div className="page-container">
          <nav className="nav">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                B
              </div>
              <span className="text-xl font-medium">BlogStack</span>
            </div>
            <div className="nav-links">
              <Link href="/features" className="nav-link">
                Features
              </Link>
              <Link href="/pricing" className="nav-link">
                Pricing
              </Link>
              <Link href="/docs" className="nav-link">
                Docs
              </Link>
              {session ? (
                <div className="flex items-center gap-4">
                  <Link href="/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                  <LogoutLink>
                    <Button variant="outline" size="sm">
                      Logout
                    </Button>
                  </LogoutLink>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <LoginLink>
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </LoginLink>
                  <RegisterLink>
                    <Button size="sm">Get Started</Button>
                  </RegisterLink>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="hero bg-gradient-to-b from-background to-muted/30">
          <div className="page-container">
            <h1 className="hero-title">
              Create beautiful blogs with <span className="text-gradient">BlogStack</span>
            </h1>
            <p className="hero-subtitle">
              A modern, multi-tenant blogging platform for creators, businesses, and everyone in between. Publish your
              thoughts with elegance and simplicity.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <RegisterLink>
                <Button size="lg" className="hover-lift">
                  Start for free <SimpleIcon name="arrowright" className="ml-2" size={16} />
                </Button>
              </RegisterLink>
              <Link href="/examples">
                <Button variant="outline" size="lg" className="hover-lift">
                  View examples
                </Button>
              </Link>
            </div>
            <div className="card-hover mx-auto mt-16 max-w-5xl overflow-hidden rounded-xl shadow-lg">
              <div className="flex aspect-video items-center justify-center rounded-xl border border-border bg-card p-4">
                <div className="text-lg text-muted-foreground">Blog preview image</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="page-container">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-medium md:text-4xl">Powerful features for modern blogging</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Everything you need to create, manage, and grow your blog, all in one place.
              </p>
            </div>
            <div className="card-grid">
              <div className="card">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <SimpleIcon name="edit" size={24} className="text-primary" />
                </div>
                <h3 className="card-title">Rich Text Editor</h3>
                <p className="card-content">
                  Create beautiful content with our intuitive editor. Support for images, code blocks, embeds, and more.
                </p>
              </div>
              <div className="card">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <SimpleIcon name="globe" size={24} className="text-primary" />
                </div>
                <h3 className="card-title">Custom Domains</h3>
                <p className="card-content">
                  Connect your own domain or use our free subdomain. Your blog, your brand.
                </p>
              </div>
              <div className="card">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <SimpleIcon name="layers" size={24} className="text-primary" />
                </div>
                <h3 className="card-title">Multi-tenant</h3>
                <p className="card-content">
                  Manage multiple blogs from a single dashboard. Perfect for agencies and creators.
                </p>
              </div>
              <div className="card">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <SimpleIcon name="users" size={24} className="text-primary" />
                </div>
                <h3 className="card-title">Team Collaboration</h3>
                <p className="card-content">
                  Invite team members to collaborate on your blog. Assign roles and permissions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted/30 py-16">
          <div className="page-container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-medium md:text-4xl">Ready to start your blogging journey?</h2>
              <p className="mb-8 text-muted-foreground">
                Join thousands of creators and businesses who trust BlogStack for their content needs.
              </p>
              <RegisterLink>
                <Button size="lg" className="hover-lift">
                  Get started for free
                </Button>
              </RegisterLink>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="page-container">
          <div className="footer-content">
            <div className="footer-column">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  B
                </div>
                <span className="text-lg font-medium">BlogStack</span>
              </div>
              <p className="text-muted-foreground">
                A modern, multi-tenant blogging platform for creators and businesses.
              </p>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="text-muted-foreground transition-colors hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/roadmap" className="text-muted-foreground transition-colors hover:text-foreground">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/docs" className="text-muted-foreground transition-colors hover:text-foreground">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-muted-foreground transition-colors hover:text-foreground">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="text-muted-foreground transition-colors hover:text-foreground">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground transition-colors hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} BlogStack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
