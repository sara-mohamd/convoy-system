## File Strucute
```
src/
├── modules/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── committee.controller.ts
│   │   ├── convoy.committe.ts
│   │   └── role.controllers.ts
│   ├── router/
|   |   ├── auth.router.ts
│   │   ├── committee.router.ts
│   │   ├── convoy.router.ts
│   │   └── role.router.ts
│   ├── middelwares/
│   │   ├── permissions.middleware.ts
│   │   └── auth.middleware.ts
│   │  
├── utils/
│   │   └── ... (e.g., password hashing)
├── config/
│       └── db.ts
├── prisma/
│   └── prisma/ (output from prisma client)
├── app.ts  (Express app configuration, middleware setup)
└── server.ts (HTTP server setup, start listening)
```