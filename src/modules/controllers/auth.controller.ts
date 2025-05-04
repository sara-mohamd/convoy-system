import prisma from "../../config/db"
import type { Request, Response, RequestHandler } from "express"
import { hashPassword, comparePasswords } from "../../utils/password.utils"
import { createJWT } from "../../utils/token.utils"

interface SignupRequestBody {
  username: string
  email: string
  password: string
  phoneNumber?: string
}

interface SigninRequestBody {
  email: string
  password: string
}

/**
 * Create a new user with required fields and assign default role
 */
export const createNewUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, phoneNumber }: SignupRequestBody = req.body

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" })
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists" })
    }

    // Check if phone number is provided and if it's already in use
    if (phoneNumber) {
      const existingPhoneNumber = await prisma.user.findUnique({
        where: { phoneNumber },
      })

      if (existingPhoneNumber) {
        return res.status(409).json({ error: "Phone number is already in use" })
      }
    }

    // Find or create default guest role
    let guestRole = await prisma.role.findFirst({
      where: { name: "guest" },
    })

    if (!guestRole) {
      guestRole = await prisma.role.create({
        data: {
          name: "guest",
          description: "Default role for new users",
        },
      })
    }

    // Create user with transaction to ensure role assignment
    const user = await prisma.$transaction(async (tx) => {
      // Create the user
      const newUser = await tx.user.create({
        data: {
          username,
          email,
          password: await hashPassword(password),
          phoneNumber,
          isActive: false, // Default to inactive, can be activated later
        },
      })

      // Assign default role
      await tx.userRole.create({
        data: {
          userId: newUser.id,
          roleId: guestRole.id,
        },
      })

      return newUser
    })

    // Generate JWT token
    const token = createJWT(user)

    // Return user data (excluding password) and token
    const { password: _, ...userData } = user
    res.status(201).json({
      message: "User created successfully",
      user: userData,
      token,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    res.status(500).json({ error: "Failed to create user" })
  }
}

/**
 * Sign in user with email and password
 */
export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password }: SigninRequestBody = req.body

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            role: true,
          },
        },
      },
    })

    // Check if user exists
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: "Account is not activated. Please contact an administrator." })
    }

    // Verify password
    const isValid = await comparePasswords(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Generate JWT token
    const token = createJWT(user)

    // Return user data (excluding password) and token
    const { password: _, ...userData } = user
    res.status(200).json({
      message: "Login successful",
      user: userData,
      token,
    })
  } catch (error) {
    console.error("Error during signin:", error)
    res.status(500).json({ error: "An error occurred during login" })
  }
}

/**
 * Activate a user account
 */
export const activateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Update user to active
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    })

    const { password: _, ...userData } = updatedUser
    res.status(200).json({
      message: "User activated successfully",
      user: userData,
    })
  } catch (error) {
    console.error("Error activating user:", error)
    res.status(500).json({ error: "Failed to activate user" })
  }
}

/**
 * Change user role
 */
export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { roleId } = req.body

    // Validate required fields
    if (!roleId) {
      return res.status(400).json({ error: "Role ID is required" })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    })

    if (!role) {
      return res.status(404).json({ error: "Role not found" })
    }

    // Update user role with transaction
    await prisma.$transaction(async (tx) => {
      // Delete existing roles
      await tx.userRole.deleteMany({
        where: { userId },
      })

      // Assign new role
      await tx.userRole.create({
        data: {
          userId,
          roleId,
        },
      })
    })

    res.status(200).json({ message: "User role updated successfully" })
  } catch (error) {
    console.error("Error changing user role:", error)
    res.status(500).json({ error: "Failed to change user role" })
  }
}
