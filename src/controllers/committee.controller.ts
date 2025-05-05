import prisma from "@/config/db"
import type { Request, Response } from "express"

// Get all committees
export const getAllCommittees = async (req: Request, res: Response) => {
  try {
    const committees = await prisma.committee.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                phoneNumber: true,
                isActive: true,
              },
            },
          },
        },
      },
    })

    res.status(200).json(committees)
  } catch (error) {
    console.error("Error fetching committees:", error)
    res.status(500).json({ error: "Failed to fetch committees" })
  }
}

// Get committee by ID
export const getCommitteeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const committee = await prisma.committee.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                phoneNumber: true,
                isActive: true,
              },
            },
          },
        },
        volunteerApplications: true,
        convoyParticipant: true,
      },
    })

    if (!committee) {
      return res.status(404).json({ error: "Committee not found" })
    }

    res.status(200).json(committee)
  } catch (error) {
    console.error("Error fetching committee:", error)
    res.status(500).json({ error: "Failed to fetch committee" })
  }
}

// Create a new committee
export const createCommittee = async (req: Request, res: Response) => {
  try {
    const { name, description, memberIds } = req.body

    if (!name) {
      return res.status(400).json({ error: "Committee name is required" })
    }

    // Check if committee with same name exists
    const existingCommittee = await prisma.committee.findUnique({
      where: { name },
    })

    if (existingCommittee) {
      return res.status(409).json({ error: "Committee with this name already exists" })
    }

    // Create committee
    const committee = await prisma.committee.create({
      data: {
        name,
        description,
      },
    })

    // Add members if provided
    if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      const memberConnections = memberIds.map((userId) => ({
        userId,
        committeeId: committee.id,
      }))

      await prisma.committeeMember.createMany({
        data: memberConnections,
      })
    }

    res.status(201).json({
      message: "Committee created successfully",
      committee,
    })
  } catch (error) {
    console.error("Error creating committee:", error)
    res.status(500).json({ error: "Failed to create committee" })
  }
}

// Update a committee
export const updateCommittee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, memberIds } = req.body

    // Update committee
    const committee = await prisma.committee.update({
      where: { id },
      data: {
        name,
        description,
      },
    })

    // Update members if provided
    if (memberIds && Array.isArray(memberIds)) {
      // Delete existing members
      await prisma.committeeMember.deleteMany({
        where: { committeeId: id },
      })

      // Add new members
      if (memberIds.length > 0) {
        const memberConnections = memberIds.map((userId) => ({
          userId,
          committeeId: id,
        }))

        await prisma.committeeMember.createMany({
          data: memberConnections,
        })
      }
    }

    res.status(200).json({
      message: "Committee updated successfully",
      committee,
    })
  } catch (error) {
    console.error("Error updating committee:", error)
    res.status(500).json({ error: "Failed to update committee" })
  }
}

// Add member to committee
export const addMemberToCommittee = async (req: Request, res: Response) => {
  try {
    const { committeeId, userId } = req.body

    if (!committeeId || !userId) {
      return res.status(400).json({ error: "Committee ID and User ID are required" })
    }

    // Check if user and committee exist
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const committee = await prisma.committee.findUnique({ where: { id: committeeId } })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    if (!committee) {
      return res.status(404).json({ error: "Committee not found" })
    }

    // Check if user is already a member
    const existingMember = await prisma.committeeMember.findFirst({
      where: {
        userId,
        committeeId,
      },
    })

    if (existingMember) {
      return res.status(409).json({ error: "User is already a member of this committee" })
    }

    // Add user to committee
    const member = await prisma.committeeMember.create({
      data: {
        userId,
        committeeId,
      },
    })

    res.status(201).json({
      message: "Member added to committee successfully",
      member,
    })
  } catch (error) {
    console.error("Error adding member to committee:", error)
    res.status(500).json({ error: "Failed to add member to committee" })
  }
}

// Remove member from committee
export const removeMemberFromCommittee = async (req: Request, res: Response) => {
  try {
    const { committeeId, userId } = req.params

    // Check if member exists
    const member = await prisma.committeeMember.findFirst({
      where: {
        userId,
        committeeId,
      },
    })

    if (!member) {
      return res.status(404).json({ error: "Member not found in this committee" })
    }

    // Remove member
    await prisma.committeeMember.deleteMany({
      where: {
        userId,
        committeeId,
      },
    })

    res.status(200).json({ message: "Member removed from committee successfully" })
  } catch (error) {
    console.error("Error removing member from committee:", error)
    res.status(500).json({ error: "Failed to remove member from committee" })
  }
}
