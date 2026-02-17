import "dotenv/config"
import cors from "cors"
import express from "express"
import authRoutes from "./routes/authRoutes.js"
import leaderboardRoutes from "./routes/leaderboardRoutes.js"
import resourceRoutes from "./routes/resourceRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"
import { authMiddleware } from "./middleware/authMiddleware.js"

const app = express()
const port = Number(process.env.PORT ?? 4000)
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000"

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
)
app.use(express.json({ limit: "5mb" }))

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true })
})

app.use("/api/auth", authRoutes)
app.use("/api/resources", resourceRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/leaderboard", leaderboardRoutes)

// Protected route for resource list with private data visibility by user.
app.get("/api/me/resources", authMiddleware, (req, res) => {
  return res.status(200).json({ userId: req.user?.id })
})

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" })
})

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`)
})
