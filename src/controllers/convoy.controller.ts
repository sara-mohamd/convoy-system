import prisma from "@/config/db"
import type { Request, Response } from "express"

// Get all convoys
export const getAllConvoys = async (req: Request, res: Response) => {
  try {
    const convoys = await prisma.convoy.findMany({
      include: {
        participant: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            committee: true,
          },
        },
      },
    })

    res.status(200).json(convoys)
  } catch (error) {
    console.error("Error fetching convoys:", error)
    res.status(500).json({ error: "Failed to fetch convoys" })
  }
}

// Get convoy by ID
export const getConvoyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const convoy = await prisma.convoy.findUnique({
      where: { id },
      include: {
        participant: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                phoneNumber: true,
              },
            },
            committee: true,
          },
        },
        volunteerApplications: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            committee: true,
          },
        },
      },
    })

    if (!convoy) {
      return res.status(404).json({ error: "Convoy not found" })
    }

    res.status(200).json(convoy)
  } catch (error) {
    console.error("Error fetching convoy:", error)
    res.status(500).json({ error: "Failed to fetch convoy" })
  }
}

// Create a new convoy
export const createConvoy = async (req: Request, res: Response) => {
  try {
    const { name, goals, requirements, startDate, endDate, status } = req.body

    if (!name || !goals || !requirements || !startDate || !status) {
      return res.status(400).json({ error: "Name, goals, requirements, start date, and status are required" })
    }

    // Validate status
    if (!["PLANNING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELED", "POSTPONED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }

    // Create convoy
    const convoy = await prisma.convoy.create({
      data: {
        name,
        goals,
        requirements,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status,
      },
    })

    res.status(201).json({
      message: "Convoy created successfully",
      convoy,
    })
  } catch (error) {
    console.error("Error creating convoy:", error)
    res.status(500).json({ error: "Failed to create convoy" })
  }
}

// Update a convoy
export const updateConvoy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, goals, requirements, startDate, endDate, status } = req.body

    // Validate status if provided
    if (status && !["PLANNING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELED", "POSTPONED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }

    // Update convoy
    const convoy = await prisma.convoy.update({
      where: { id },
      data: {
        name,
        goals,
        requirements,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
      },
    })

    res.status(200).json({
      message: "Convoy updated successfully",
      convoy,
    })
  } catch (error) {
    console.error("Error updating convoy:", error)
    res.status(500).json({ error: "Failed to update convoy" })
  }
}

// Add participant to convoy
export const addParticipant = async (req: Request, res: Response) => {
  try {
    const { convoyId, userId, committeeId, role } = req.body

    if (!convoyId || !userId || !committeeId || !role) {
      return res.status(400).json({ error: "Convoy ID, User ID, Committee ID, and role are required" })
    }

    // Check if user, convoy, and committee exist
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const convoy = await prisma.convoy.findUnique({ where: { id: convoyId } })
    const committee = await prisma.committee.findUnique({ where: { id: committeeId } })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    if (!convoy) {
      return res.status(404).json({ error: "Convoy not found" })
    }

    if (!committee) {
      return res.status(404).json({ error: "Committee not found" })
    }

    // Check if participant already exists
    const existingParticipant = await prisma.convoyParticipant.findFirst({
      where: {
        userId,
        convoyId,
        committeeId,
      },
    })

    if (existingParticipant) {
      return res.status(409).json({ error: "Participant already exists" })
    }

    // Add participant
    const participant = await prisma.convoyParticipant.create({
      data: {
        userId,
        convoyId,
        committeeId,
        role,
        status: "ACTIVE",
      },
    })

    res.status(201).json({
      message: "Participant added successfully",
      participant,
    })
  } catch (error) {
    console.error("Error adding participant:", error)
    res.status(500).json({ error: "Failed to add participant" })
  }
}

// Update participant status
export const updateParticipantStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !["ACTIVE", "INACTIVE", "CANCELED"].includes(status)) {
      return res.status(400).json({ error: "Valid status is required" })
    }

    // Update participant
    const participant = await prisma.convoyParticipant.update({
      where: { id: Number.parseInt(id) },
      data: { status },
    })

    res.status(200).json({
      message: "Participant status updated successfully",
      participant,
    })
  } catch (error) {
    console.error("Error updating participant status:", error)
    res.status(500).json({ error: "Failed to update participant status" })
  }
}

// Remove participant from convoy
export const removeParticipant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Delete participant
    await prisma.convoyParticipant.delete({
      where: { id: Number.parseInt(id) },
    })

    res.status(200).json({ message: "Participant removed successfully" })
  } catch (error) {
    console.error("Error removing participant:", error)
    res.status(500).json({ error: "Failed to remove participant" })
  }
}
