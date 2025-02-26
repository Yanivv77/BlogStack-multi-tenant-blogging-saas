export default function Home() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-6 text-primary">Tailwind Config Test Page</h1>
      
      {/* Basic utilities test */}
      <section className="mb-10 p-6 border rounded-lg border-border bg-card text-card-foreground">
        <h2 className="text-2xl font-semibold mb-4">Basic Utilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-background text-foreground rounded-md shadow">Background & Foreground</div>
          <div className="p-4 bg-primary text-primary-foreground rounded-md shadow">Primary</div>
          <div className="p-4 bg-secondary text-secondary-foreground rounded-md shadow">Secondary</div>
          <div className="p-4 bg-muted text-muted-foreground rounded-md shadow">Muted</div>
          <div className="p-4 bg-accent text-accent-foreground rounded-md shadow">Accent</div>
          <div className="p-4 bg-destructive text-destructive-foreground rounded-md shadow">Destructive</div>
        </div>
      </section>
      
      {/* Animation test */}
      <section className="mb-10 p-6 border rounded-lg border-border">
        <h2 className="text-2xl font-semibold mb-4">Animation Test</h2>
        <div className="flex space-x-4">
          <div className="animate-accordion-down bg-primary text-primary-foreground p-4 rounded-md">
            Accordion Down
          </div>
          <div className="animate-accordion-up bg-secondary text-secondary-foreground p-4 rounded-md">
            Accordion Up
          </div>
        </div>
      </section>
      
      {/* Typography plugin test */}
      <section className="mb-10 p-6 border rounded-lg border-border">
        <h2 className="text-2xl font-semibold mb-4">Typography Plugin Test</h2>
        <div className="prose dark:prose-invert max-w-none">
          <h1>Prose Heading 1</h1>
          <p>This paragraph should be styled by the typography plugin. It should have proper spacing and line height.</p>
          <ul>
            <li>This is a list item</li>
            <li>This is another list item</li>
            <li>Typography plugin should style this properly</li>
          </ul>
          <blockquote>
            This is a blockquote. The typography plugin should add styling to this element.
          </blockquote>
          <pre><code>// This is a code block
const test = "Typography plugin test";</code></pre>
        </div>
      </section>
      
      {/* Border radius test */}
      <section className="mb-10 p-6 border rounded-lg border-border">
        <h2 className="text-2xl font-semibold mb-4">Border Radius Test</h2>
        <div className="flex space-x-4">
          <div className="p-4 bg-primary text-primary-foreground rounded-sm">rounded-sm</div>
          <div className="p-4 bg-primary text-primary-foreground rounded-md">rounded-md</div>
          <div className="p-4 bg-primary text-primary-foreground rounded-lg">rounded-lg</div>
        </div>
      </section>
      
      {/* Dark mode indicator */}
      <section className="fixed top-4 right-4 p-2 bg-background text-foreground rounded-full shadow-lg">
        <div className="text-sm font-mono">
          <span className="dark:hidden">🌞 Light Mode</span>
          <span className="hidden dark:inline">🌙 Dark Mode</span>
        </div>
      </section>
    </div>
  );
}
