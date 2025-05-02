import { PrismaClient } from "@prisma/client";
import { configDotenv } from "dotenv";
configDotenv
const prisma = new PrismaClient()
export default prisma
