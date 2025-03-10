import { Button } from "@/components/ui/button";
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight, Edit, Globe, Layers, Users } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const { getUser } = getKindeServerSession();
  const session = await getUser();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b border-border">
        <div className="page-container">
          <nav className="nav">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">B</div>
              <span className="text-xl font-medium">BlogStack</span>
            </div>
            <div className="nav-links">
              <Link href="/features" className="nav-link">Features</Link>
              <Link href="/pricing" className="nav-link">Pricing</Link>
              <Link href="/docs" className="nav-link">Docs</Link>
              {session ? (
                <div className="flex items-center gap-4">
                  <Link href="/dashboard" className="nav-link">Dashboard</Link>
                  <LogoutLink>
                    <Button variant="outline" size="sm">Logout</Button>
                  </LogoutLink>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <LoginLink>
                    <Button variant="outline" size="sm">Login</Button>
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
              A modern, multi-tenant blogging platform for creators, businesses, and everyone in between.
              Publish your thoughts with elegance and simplicity.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <RegisterLink>
                <Button size="lg" className="hover-lift">
                  Start for free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </RegisterLink>
              <Link href="/examples">
                <Button variant="outline" size="lg" className="hover-lift">
                  View examples
                </Button>
              </Link>
            </div>
            <div className="mt-16 max-w-5xl mx-auto rounded-xl overflow-hidden shadow-lg card-hover">
              <div className="aspect-video bg-card rounded-xl border border-border p-4 flex items-center justify-center">
                <div className="text-muted-foreground text-lg">Blog preview image</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="page-container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-medium mb-4">Powerful features for modern blogging</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to create, manage, and grow your blog, all in one place.
              </p>
            </div>
            <div className="card-grid">
              <div className="card">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Edit className="h-6 w-6 text-primary" />
                </div>
                <h3 className="card-title">Rich Text Editor</h3>
                <p className="card-content">
                  Create beautiful content with our intuitive editor. Support for images, code blocks, embeds, and more.
                </p>
              </div>
              <div className="card">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="card-title">Custom Domains</h3>
                <p className="card-content">
                  Connect your own domain or use our free subdomain. Your blog, your brand.
                </p>
              </div>
              <div className="card">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <h3 className="card-title">Multi-tenant</h3>
                <p className="card-content">
                  Manage multiple blogs from a single dashboard. Perfect for agencies and creators.
                </p>
              </div>
              <div className="card">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
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
        <section className="py-16 bg-muted/30">
          <div className="page-container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-medium mb-4">Ready to start your blogging journey?</h2>
              <p className="text-muted-foreground mb-8">
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
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">B</div>
                <span className="text-lg font-medium">BlogStack</span>
              </div>
              <p className="text-muted-foreground">
                A modern, multi-tenant blogging platform for creators and businesses.
              </p>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/roadmap" className="text-muted-foreground hover:text-foreground transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="/guides" className="text-muted-foreground hover:text-foreground transition-colors">Guides</Link></li>
                <li><Link href="/api" className="text-muted-foreground hover:text-foreground transition-colors">API</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
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
