# Utils Folder Structure

This folder contains utility functions and helpers organized by domain and functionality.

## Structure

```
utils/
├── index.ts                # Main entry point that re-exports all utilities
├── README.md               # This documentation file
│
├── auth/                   # Authentication utilities
│   └── user.ts             # User authentication helpers
│
├── constants/              # Application constants
│   ├── index.ts            # Re-exports all constants
│   └── images.ts           # Image-related constants
│
├── db/                     # Database utilities
│   └── prisma.ts           # Prisma client singleton
│
├── upload/                 # File upload utilities
│   └── uploadthing.ts      # UploadThing components and configuration
│
└── validation/             # Form validation schemas
    ├── index.ts            # Re-exports all validation schemas
    ├── common.ts           # Common field definitions
    ├── messages.ts         # Validation error messages
    ├── postSchema.ts       # Post validation schemas
    └── siteSchema.ts       # Site validation schemas
```

## Usage

Import utilities from the main index file:

```typescript
import { prisma, requireUser, ValidationMessages, PostSchema } from "@/app/utils";
```

Or import specific utilities directly:

```typescript
import { requireUser } from "@/app/utils/auth/user";
import prisma from "@/app/utils/db/prisma";
```

## Best Practices

1. **Domain-Driven Organization**: Keep related utilities together in domain-specific folders.
2. **Single Responsibility**: Each file should have a single responsibility.
3. **Documentation**: Document functions and types with JSDoc comments.
4. **Type Safety**: Use TypeScript types for all functions and parameters.
5. **Re-export Pattern**: Use index files to re-export utilities for easier imports.
6. **Consistent Naming**: Use consistent naming conventions across all utilities. 