## File Strucute
```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── auth.types.ts (or interfaces.ts)
│   ├── users/
│   │   └── ... (similar structure)
│   ├── convoy/
│   │   └── ...
│   └── ... (other modules like committee, village)
├── core/
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── utils/
│   │   └── ... (e.g., password hashing)
│   └── config/
│       └── index.ts (for env vars)
├── prisma/
│   └── prisma/ (output from prisma client)
├── app.ts  (Express app configuration, middleware setup)
└── server.ts (HTTP server setup, start listening)
```