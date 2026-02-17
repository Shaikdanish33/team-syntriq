import { Router } from "express"
import {
  createRequest,
  createResource,
  deleteResource,
  fulfillRequest,
  getRequests,
  getResourceById,
  getResources,
  updateResource,
} from "../controllers/resourceController.js"
import { authMiddleware } from "../middleware/authMiddleware.js"

const router = Router()

router.get("/", getResources)
router.get("/requests/list", getRequests)
router.get("/:id", getResourceById)
router.post("/", authMiddleware, createResource)
router.put("/:id", authMiddleware, updateResource)
router.delete("/:id", authMiddleware, deleteResource)
router.post("/requests", authMiddleware, createRequest)
router.patch("/requests/:id/fulfill", authMiddleware, fulfillRequest)

export default router
