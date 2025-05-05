# Convoy System Backend

This is the backend for the Convoy System, built with Node.js, Express, TypeScript, and Prisma ORM (PostgreSQL).

## Features
- User authentication and role-based authorization (JWT)
- Permissions system with fine-grained access control
- Management of users, roles, permissions, committees, convoys, villages, and volunteers
- RESTful API with OpenAPI (Swagger) documentation
- Secure password hashing (bcrypt)
- Database migrations and seeding with Prisma

## Project Structure
```
src/
├── constants/           # Permission constants and descriptions
├── config/              # Database config
├── controllers/         # Express route controllers
├── middleware/          # Auth and permission middleware
├── prisma/              # Prisma schema, migrations, and seed script
├── routes/              # Express route definitions
├── utils/               # Utility functions (e.g., password hashing)
├── app.ts               # Express app configuration
└── server.ts            # HTTP server setup
```

## Database
- Uses PostgreSQL
- Prisma ORM for schema, migrations, and queries
- See `src/prisma/schema.prisma` for the full data model

## Seeding
To seed the database with demo data (users, roles, permissions, committees, convoys, etc.):

```
npx prisma db seed
```

## Running the Project
1. Install dependencies:
   ```
   pnpm install
   ```
2. Set up your `.env` file with the correct `DATABASE_URL` and `JWT_SECRET`.
3. Run migrations:
   ```
   npx prisma migrate deploy
   ```
4. Start the development server:
   ```
   pnpm dev
   ```

## API Documentation
- The OpenAPI schema is in `openapi.yaml`.
- You can use Swagger UI, Postman, or similar tools to test the API.
- Most routes require a Bearer JWT token for authentication.

## Permissions & Roles
- All permissions are defined in `src/constants/permissions.ts`.
- Roles are assigned permissions and users can have multiple roles.
- The `SUPER_ADMIN` role automatically has all permissions.

## Contributing
- Please open issues or pull requests for improvements or bug fixes.

---

For more details, see the code and comments in each file.