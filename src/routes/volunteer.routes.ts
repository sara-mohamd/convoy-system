import express from "express"
import {
  getAllApplications,
  getApplicationsByUser,
  getApplicationsByConvoy,
  createApplication,
  updateApplicationStatus,
  blockVolunteer,
} from "../controllers/volunteer.controller"
import { authenticate } from "../middleware/auth.middleware"
import { authorize } from "../middleware/permission.middleware"
import { asHandler } from "../utils/controller.utils"

const router = express.Router()

// All routes require authentication
router.use(authenticate)

router.get("/", authorize("viewApplications"), asHandler(getAllApplications))
router.get("/user/:userId", asHandler(getApplicationsByUser))
router.get("/convoy/:convoyId", authorize("viewConvoyApplications"), asHandler(getApplicationsByConvoy))
router.post("/", asHandler(createApplication))
router.patch(
  "/:userId/:convoyId/:committeeId/status",
  authorize("manageApplications"),
  asHandler(updateApplicationStatus),
)
router.patch("/:userId/:convoyId/:committeeId/block", authorize("blockVolunteer"), asHandler(blockVolunteer))

export default router
