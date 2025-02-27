
import { EmptyState } from "../components/dashboard/EmptyState";
import { requireUser } from "../utils/requireUser";



export default async function DashboardIndexPage() {
  const user = await requireUser();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-5">Your Sites</h1>

        <EmptyState
          title="You dont have any sites created"
          description="You currently dont have any Sites. Please create some so that you can see them right here."
          href="/dashboard/sites/new"
          buttonText="Create Site"
        />

      <h1 className="text-2xl mt-10 font-semibold mb-5">Recent Articles</h1>

        <EmptyState
          title="You dont have any articles created"
          description="Your currently dont have any articles created. Please create some so that you can see them right here"
          buttonText="Create Article"
          href="/dashboard/sites"
        />
      
    </div>
  );
}