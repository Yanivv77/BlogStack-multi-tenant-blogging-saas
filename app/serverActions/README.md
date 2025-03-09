# Actions Folder Structure

This folder contains server actions for the BlogStack application, organized by domain and functionality.

## Structure

```
serverActions/
├── index.ts                # Re-exports all actions
├── utils/
│   └── helpers.ts          # Common utility functions
├── site/
│   ├── createSite.ts       # Create a new site
│   ├── updateSite.ts       # Update an existing site
│   └── deleteSite.ts       # Delete a site
├── post/
│   ├── createPost.ts       # Create a new post
│   ├── editPost.ts         # Edit an existing post
│   └── deletePost.ts       # Delete a post
└── image/
    └── updateImage.ts      # Update images for sites and posts
```

## Usage

Import actions from the index file:

```typescript
import { CreateSiteAction, UpdateSiteAction, DeleteSite } from "@/app/actions";
```

## Best Practices

1. **Authentication**: Always check if the user is authenticated before performing any action.
2. **Authorization**: Verify that the user has permission to perform the action (e.g., owns the site).
3. **Validation**: Use Zod schemas to validate form data.
4. **Error Handling**: Catch and handle errors properly, providing meaningful error messages.
5. **Transactions**: Use transactions for operations that modify multiple records.
6. **Soft Deletes**: Use soft deletes (setting a `deletedAt` timestamp) instead of hard deletes when appropriate.

## Helper Functions

Common utility functions are available in `utils/helpers.ts`:

- `getAuthenticatedUser()`: Gets the authenticated user or returns null
- `verifyUserOwnsSite(siteId, userId)`: Verifies that a user owns a site
- `toNullable(value)`: Converts empty strings to null
- `createErrorResponse(message)`: Creates a standardized error response
- `createSuccessResponse()`: Creates a standardized success response 