import prisma from "../../config/db"
import type { Request, Response } from "express"

// Get all villages
export const getAllVillages = async (req: Request, res: Response) => {
  try {
    const villages = await prisma.village.findMany({
      include: {
        villageData: true,
      },
    })

    res.status(200).json(villages)
  } catch (error) {
    console.error("Error fetching villages:", error)
    res.status(500).json({ error: "Failed to fetch villages" })
  }
}

// Get village by ID
export const getVillageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const village = await prisma.village.findUnique({
      where: { id },
      include: {
        villageData: {
          include: {
            recordedBy: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!village) {
      return res.status(404).json({ error: "Village not found" })
    }

    res.status(200).json(village)
  } catch (error) {
    console.error("Error fetching village:", error)
    res.status(500).json({ error: "Failed to fetch village" })
  }
}

// Create a new village
export const createVillage = async (req: Request, res: Response) => {
  try {
    const { name, location } = req.body

    if (!name || !location) {
      return res.status(400).json({ error: "Name and location are required" })
    }

    // Create village
    const village = await prisma.village.create({
      data: {
        name,
        location,
      },
    })

    res.status(201).json({
      message: "Village created successfully",
      village,
    })
  } catch (error) {
    console.error("Error creating village:", error)
    res.status(500).json({ error: "Failed to create village" })
  }
}

// Update a village
export const updateVillage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, location } = req.body

    // Update village
    const village = await prisma.village.update({
      where: { id },
      data: {
        name,
        location,
      },
    })

    res.status(200).json({
      message: "Village updated successfully",
      village,
    })
  } catch (error) {
    console.error("Error updating village:", error)
    res.status(500).json({ error: "Failed to update village" })
  }
}

// Record village data
export const recordVillageData = async (req: Request, res: Response) => {
  try {
    const { villageId, userId, data } = req.body

    if (!villageId || !userId || !data) {
      return res.status(400).json({ error: "Village ID, User ID, and data are required" })
    }

    // Check if village and user exist
    const village = await prisma.village.findUnique({ where: { id: villageId } })
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!village) {
      return res.status(404).json({ error: "Village not found" })
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Record data
    const villageData = await prisma.villageData.create({
      data: {
        villageId,
        userId,
        data,
      },
    })

    res.status(201).json({
      message: "Village data recorded successfully",
      villageData,
    })
  } catch (error) {
    console.error("Error recording village data:", error)
    res.status(500).json({ error: "Failed to record village data" })
  }
}

// Get village data by ID
export const getVillageDataById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const villageData = await prisma.villageData.findUnique({
      where: { id },
      include: {
        village: true,
        recordedBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    })

    if (!villageData) {
      return res.status(404).json({ error: "Village data not found" })
    }

    res.status(200).json(villageData)
  } catch (error) {
    console.error("Error fetching village data:", error)
    res.status(500).json({ error: "Failed to fetch village data" })
  }
}

// Update village data
export const updateVillageData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { data } = req.body

    if (!data) {
      return res.status(400).json({ error: "Data is required" })
    }

    // Update village data
    const villageData = await prisma.villageData.update({
      where: { id },
      data: { data },
    })

    res.status(200).json({
      message: "Village data updated successfully",
      villageData,
    })
  } catch (error) {
    console.error("Error updating village data:", error)
    res.status(500).json({ error: "Failed to update village data" })
  }
}
