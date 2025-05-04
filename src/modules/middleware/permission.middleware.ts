import type { RequestHandler } from "express"

export const authorize = (requiredPermission: string): RequestHandler => {
  return (req, res, next) => {
    try {
      // Check if user exists in request
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" })
        return // Return without a value
      }

      // Get user permissions
      const userPermissions = new Set<string>()

      // Extract permissions from user roles
      req.user.role.forEach((userRole: any) => {
        userRole.role.permission.forEach((rolePermission: any) => {
          userPermissions.add(rolePermission.Permission.name)
        })
      })

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
}
