import express from "express"
import {
  getAllConvoys,
  getConvoyById,
  createConvoy,
  updateConvoy,
  addParticipant,
  updateParticipantStatus,
  removeParticipant,
} from "../controllers/convoy.controller"
import { authenticate } from "../middleware/auth.middleware"
import { authorize } from "../middleware/permission.middleware"
import { asHandler } from "../../utils/controller.utils"

const router = express.Router()

// All routes require authentication
router.use(authenticate)

router.get("/", asHandler(getAllConvoys))
router.get("/:id", asHandler(getConvoyById))
router.post("/", authorize("createConvoy"), asHandler(createConvoy))
router.put("/:id", authorize("updateConvoy"), asHandler(updateConvoy))
router.post("/participants", authorize("manageConvoyParticipants"), asHandler(addParticipant))
router.patch("/participants/:id/status", authorize("manageConvoyParticipants"), asHandler(updateParticipantStatus))
router.delete("/participants/:id", authorize("manageConvoyParticipants"), asHandler(removeParticipant))

export default router
