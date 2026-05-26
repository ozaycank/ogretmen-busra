import { IMaterialRepository } from "../../domain/repositories/material.repository.interface";
import { Material, MaterialStatus } from "../../domain/entities/material.entity";

export class MaterialService {
    // Constructor Injection allows for easy mocking
    constructor(private readonly repository: IMaterialRepository) { }

    async getMaterialDetails(id: string): Promise<Material> {
        const material = await this.repository.findById(id);
        if (!material) {
            throw new Error("Material not found");
        }
        return material;
    }

    async publishMaterial(data: Omit<Material, "id" | "createdAt">): Promise<Material> {
        // Business logic execution
        if (data.title.length < 5) {
            throw new Error("Title too short");
        }

        data.status = MaterialStatus.UPLOAD_PENDING;
        return await this.repository.create(data);
    }
}