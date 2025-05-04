import express from "express"
import {
  getAllVillages,
  getVillageById,
  createVillage,
  updateVillage,
  recordVillageData,
  getVillageDataById,
  updateVillageData,
} from "../controllers/village.controller"
import { authenticate } from "../middleware/auth.middleware"
import { authorize } from "../middleware/permission.middleware"
import { asHandler } from "../../utils/controller.utils"

const router = express.Router()

// All routes require authentication
router.use(authenticate)

router.get("/", asHandler(getAllVillages))
router.get("/:id", asHandler(getVillageById))
router.post("/", authorize("manageVillages"), asHandler(createVillage))
router.put("/:id", authorize("manageVillages"), asHandler(updateVillage))
router.post("/data", authorize("recordVillageData"), asHandler(recordVillageData))
router.get("/data/:id", asHandler(getVillageDataById))
router.put("/data/:id", authorize("updateVillageData"), asHandler(updateVillageData))

export default router
