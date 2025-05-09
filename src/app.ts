import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import 'dotenv/config'
// Load environment variables

// Import routes
import authRoutes from "./routes/auth.routes"
import roleRoutes from "./routes/role.routes"
import committeeRoutes from "./routes/committee.routes"
import volunteerRoutes from "./routes/volunteer.routes"
import convoyRoutes from "./routes/convoy.routes"
import villageRoutes from "./routes/village.routes"

// Initialize express app
const app = express()

// Middleware
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/roles", roleRoutes)
app.use("/api/committees", committeeRoutes)
app.use("/api/volunteers", volunteerRoutes)
app.use("/api/convoys", convoyRoutes)
app.use("/api/villages", villageRoutes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
