import { Permission } from '@/constants/permissions'
import type { RequestHandler } from "express"

export const authorize = (requiredPermission: Permission): RequestHandler => (req, res, next) => {
  try {
    // Check if user exists in request
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" })
      return // Return without a value
    }

    // Get user permissions
    const userPermissions = new Set<Permission>()

    req.user

    // Extract permissions from user roles
    let isSuperAdmin = false;
    req.user.role.forEach((userRole) => {
      if (userRole.role.name === "SUPER_ADMIN") {
        isSuperAdmin = true;
      }
      userRole.role.permission.forEach((rolePermission) => {
        userPermissions.add(rolePermission.Permission.name as Permission)
      })
    })

    // Allow SUPER_ADMIN to bypass permission checks
    if (isSuperAdmin) {
      return next();
    }

    // Check if user has required permission
    if (!userPermissions.has(requiredPermission)) {
      res.status(403).json({ error: "Insufficient permissions" })
      return // Return without a value
    }

    next()
  } catch (error) {
    console.error("Authorization error:", error)
    res.status(500).json({ error: "Authorization error" })
    // No return statement here
  }
}
