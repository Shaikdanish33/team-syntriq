import { Router } from "express"
import {
  createReview,
  deleteReview,
  getReviewsForResource,
  updateReview,
} from "../controllers/reviewController.js"
import { authMiddleware } from "../middleware/authMiddleware.js"

const router = Router()

router.get("/", getReviewsForResource)
router.post("/", authMiddleware, createReview)
router.put("/:id", authMiddleware, updateReview)
router.delete("/:id", authMiddleware, deleteReview)

export default router
