import { PrismaClient } from "@prisma/client";
import { PrismaMaterialRepository } from "../database/prisma.material.repository";
import { MaterialService } from "../../application/services/material.service";
import { prisma } from "@/lib/db/prisma"; // Your existing singleton

// Manual DI Container
const materialRepository = new PrismaMaterialRepository(prisma);
export const materialService = new MaterialService(materialRepository);