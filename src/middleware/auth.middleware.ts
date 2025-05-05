import type { RequestHandler } from "express"
import jwt from "jsonwebtoken"
import prisma from "@/config/db"

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  role: {
    role: {
      id: string;
      name: string;
      description: string | null;
      permission: {
        Permission: {
          name: string;
          description: string | null;
        };
      }[];
    };
  }[];
}


declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Authentication required" })
      return // Return without a value
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
        role: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                permission: {
                  select: {
                    Permission: {
                      select: { name: true, description: true },
                    },
                  },
                },
              }
            },
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({ error: "User not found" })
      return // Return without a value
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({ error: "Account is not active" })
      return // Return without a value
    }

    console.log(
      "Authenticated user: ",
      JSON.stringify(user)
    );

    // Add user to request
    req.user = user

    next()
  } catch (error) {
    console.error("Authentication error:", error)
    res.status(401).json({ error: "Invalid token" })
    // No return statement here
  }
}
