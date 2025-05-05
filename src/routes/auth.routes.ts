import express from "express"
import { createNewUser, signin, activateUser, changeUserRole } from "../controllers/auth.controller"
import { authenticate } from "../middleware/auth.middleware"
import { authorize } from "../middleware/permission.middleware"
import { asHandler } from "../utils/controller.utils"

const router = express.Router()

// Public routes
router.post("/signup", createNewUser)
router.post("/signin", asHandler(signin))

// Protected routes
router.patch("/users/:userId/activate", authenticate, authorize("activateUser"), asHandler(activateUser))
router.patch("/users/:userId/role", authenticate, authorize("changeUserRole"), asHandler(changeUserRole))

export default router
