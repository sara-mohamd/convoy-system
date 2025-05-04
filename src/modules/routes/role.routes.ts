import express from "express"
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  createPermission,
} from "../controllers/role.controller"
import { authenticate } from "../middleware/auth.middleware"
import { authorize } from "../middleware/permission.middleware"
import { asHandler } from "../../utils/controller.utils"

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// Roles
router.get("/", authorize("viewRoles"), asHandler(getAllRoles))
router.post("/", authorize("createRole"), asHandler(createRole))
router.put("/:id", authorize("updateRole"), asHandler(updateRole))
router.delete("/:id", authorize("deleteRole"), asHandler(deleteRole))

// Permissions
router.get("/permissions", authorize("viewPermissions"), asHandler(getAllPermissions))
router.post("/permissions", authorize("createPermission"), asHandler(createPermission))

export default router
