import express from "express"
import {
  getAllCommittees,
  getCommitteeById,
  createCommittee,
  updateCommittee,
  addMemberToCommittee,
  removeMemberFromCommittee,
} from "../controllers/committee.controller"
import { authenticate } from "../middleware/auth.middleware"
import { authorize } from "../middleware/permission.middleware"
import { asHandler } from "../utils/controller.utils"

const router = express.Router()

// All routes require authentication
router.use(authenticate)

router.get("/", asHandler(getAllCommittees))
router.get("/:id", asHandler(getCommitteeById))
router.post("/", authorize("createCommittee"), asHandler(createCommittee))
router.put("/:id", authorize("updateCommittee"), asHandler(updateCommittee))
router.post("/members", authorize("manageCommitteeMembers"), asHandler(addMemberToCommittee))
router.delete(
  "/:committeeId/members/:userId",
  authorize("manageCommitteeMembers"),
  asHandler(removeMemberFromCommittee),
)

export default router
