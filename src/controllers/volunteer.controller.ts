import prisma from "@/config/db"
import type { Request, Response } from "express"

// Get all volunteer applications
export const getAllApplications = async (req: Request, res: Response) => {
  try {
    const applications = await prisma.volunteerApplication.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phoneNumber: true,
          },
        },
        convoy: true,
        committee: true,
      },
    })

    res.status(200).json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    res.status(500).json({ error: "Failed to fetch applications" })
  }
}

// Get applications by user ID
export const getApplicationsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    const applications = await prisma.volunteerApplication.findMany({
      where: { userId },
      include: {
        convoy: true,
        committee: true,
      },
    })

    res.status(200).json(applications)
  } catch (error) {
    console.error("Error fetching user applications:", error)
    res.status(500).json({ error: "Failed to fetch user applications" })
  }
}

// Get applications by convoy ID
export const getApplicationsByConvoy = async (req: Request, res: Response) => {
  try {
    const { convoyId } = req.params

    const applications = await prisma.volunteerApplication.findMany({
      where: { convoyId },
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
    })

    res.status(200).json(applications)
  } catch (error) {
    console.error("Error fetching convoy applications:", error)
    res.status(500).json({ error: "Failed to fetch convoy applications" })
  }
}

// Create a volunteer application
export const createApplication = async (req: Request, res: Response) => {
  try {
    const { userId, convoyId, committeeId } = req.body

    if (!userId || !convoyId || !committeeId) {
      return res.status(400).json({ error: "User ID, Convoy ID, and Committee ID are required" })
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

    // Check if application already exists
    const existingApplication = await prisma.volunteerApplication.findFirst({
      where: {
        userId,
        convoyId,
        committeeId,
      },
    })

    if (existingApplication) {
      return res.status(409).json({ error: "Application already exists" })
    }

    // Create application
    const application = await prisma.volunteerApplication.create({
      data: {
        userId,
        convoyId,
        committeeId,
        status: "PENDING",
      },
    })

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    })
  } catch (error) {
    console.error("Error creating application:", error)
    res.status(500).json({ error: "Failed to create application" })
  }
}

// Update application status
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { userId, convoyId, committeeId } = req.params
    const { status, rejectionReason } = req.body

    if (!status || !["PENDING", "APPROVED", "REJECTED", "WAITLISTED"].includes(status)) {
      return res.status(400).json({ error: "Valid status is required" })
    }

    // Check if application exists
    const application = await prisma.volunteerApplication.findFirst({
      where: {
        userId,
        convoyId,
        committeeId,
      },
    })

    if (!application) {
      return res.status(404).json({ error: "Application not found" })
    }

    // Update application
    const updatedApplication = await prisma.volunteerApplication.update({
      where: {
        userId_convoyId_committeeId: {
          userId,
          convoyId,
          committeeId,
        },
      },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : null,
      },
    })

    // If approved, create convoy participant
    if (status === "APPROVED") {
      await prisma.convoyParticipant.create({
        data: {
          userId,
          convoyId,
          committeeId,
          role: "Volunteer", // Default role
          status: "ACTIVE",
        },
      })
    }

    res.status(200).json({
      message: "Application status updated successfully",
      application: updatedApplication,
    })
  } catch (error) {
    console.error("Error updating application status:", error)
    res.status(500).json({ error: "Failed to update application status" })
  }
}

// Block a volunteer
export const blockVolunteer = async (req: Request, res: Response) => {
  try {
    const { userId, convoyId, committeeId } = req.params

    // Update application
    const updatedApplication = await prisma.volunteerApplication.update({
      where: {
        userId_convoyId_committeeId: {
          userId,
          convoyId,
          committeeId,
        },
      },
      data: {
        isBlocked: true,
      },
    })

    // Update convoy participant if exists
    await prisma.convoyParticipant.updateMany({
      where: {
        userId,
        convoyId,
        committeeId,
      },
      data: {
        status: "INACTIVE",
      },
    })

    res.status(200).json({
      message: "Volunteer blocked successfully",
      application: updatedApplication,
    })
  } catch (error) {
    console.error("Error blocking volunteer:", error)
    res.status(500).json({ error: "Failed to block volunteer" })
  }
}
