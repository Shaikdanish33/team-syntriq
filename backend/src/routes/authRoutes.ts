import { Router } from "express"
import {
  getSession,
  login,
  logout,
  signUp,
  updateProfile,
} from "../controllers/authController.js"
import { authMiddleware } from "../middleware/authMiddleware.js"

const router = Router()

router.post("/signup", signUp)
router.post("/login", login)
router.post("/logout", logout)
router.get("/session", authMiddleware, getSession)
router.put("/profile", authMiddleware, updateProfile)

export default router
