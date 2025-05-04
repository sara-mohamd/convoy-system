import prisma from "../../config/db"
import type { Request, Response } from "express"

// Get all roles
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permission: {
          include: {
            Permission: true,
          },
        },
      },
    })

    res.status(200).json(roles)
  } catch (error) {
    console.error("Error fetching roles:", error)
    res.status(500).json({ error: "Failed to fetch roles" })
  }
}

// Create a new role
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description, permissions } = req.body

    if (!name) {
      return res.status(400).json({ error: "Role name is required" })
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        name,
        description,
      },
    })

    // Assign permissions if provided
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      const permissionConnections = permissions.map((permissionId) => ({
        permissionId,
        roleId: role.id,
      }))

      await prisma.rolePermission.createMany({
        data: permissionConnections,
      })
    }

    res.status(201).json({
      message: "Role created successfully",
      role,
    })
  } catch (error) {
    console.error("Error creating role:", error)
    res.status(500).json({ error: "Failed to create role" })
  }
}

// Update a role
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, permissions } = req.body

    // Update role
    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
      },
    })

    // Update permissions if provided
    if (permissions && Array.isArray(permissions)) {
      // Delete existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      })

      // Add new permissions
      if (permissions.length > 0) {
        const permissionConnections = permissions.map((permissionId) => ({
          permissionId,
          roleId: id,
        }))

        await prisma.rolePermission.createMany({
          data: permissionConnections,
        })
      }
    }

    res.status(200).json({
      message: "Role updated successfully",
      role,
    })
  } catch (error) {
    console.error("Error updating role:", error)
    res.status(500).json({ error: "Failed to update role" })
  }
}

// Delete a role
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if role is assigned to any users
    const usersWithRole = await prisma.userRole.findMany({
      where: { roleId: id },
    })

    if (usersWithRole.length > 0) {
      return res.status(400).json({
        error: "Cannot delete role that is assigned to users",
        count: usersWithRole.length,
      })
    }

    // Delete role permissions first
    await prisma.rolePermission.deleteMany({
      where: { roleId: id },
    })

    // Delete role
    await prisma.role.delete({
      where: { id },
    })

    res.status(200).json({ message: "Role deleted successfully" })
  } catch (error) {
    console.error("Error deleting role:", error)
    res.status(500).json({ error: "Failed to delete role" })
  }
}

// Permission management
export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany()
    res.status(200).json(permissions)
  } catch (error) {
    console.error("Error fetching permissions:", error)
    res.status(500).json({ error: "Failed to fetch permissions" })
  }
}

export const createPermission = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ error: "Permission name is required" })
    }

    const permission = await prisma.permission.create({
      data: {
        name,
        description,
      },
    })

    res.status(201).json({
      message: "Permission created successfully",
      permission,
    })
  } catch (error) {
    console.error("Error creating permission:", error)
    res.status(500).json({ error: "Failed to create permission" })
  }
}
