import { expect, describe, it, beforeEach } from "vitest";
import { MaterialService } from "./material.service";
import { IMaterialRepository } from "../../domain/repositories/material.repository.interface";
import { Material, MaterialStatus } from "../../domain/entities/material.entity";

// 1. Create an In-Memory Mock Repository
class MockMaterialRepository implements IMaterialRepository {
    public materials: Material[] = [];

    async findById(id: string) {
        return this.materials.find(m => m.id === id) || null;
    }

    async findAll() {
        return this.materials;
    }

    async updateStatus() {
        return;
    }

    async create(data: any) {
        const newMaterial = new Material(
            "1",
            data.title,
            data.fileUrl,
            data.fileKey,
            data.originalName,
            data.mimeType,
            data.authorName,
            data.status,
            new Date(),
            new Date()
        );
        this.materials.push(newMaterial);
        return newMaterial;
    }
}

// 2. Test the Business Logic
describe("MaterialService", () => {
    let service: MaterialService;
    let repository: MockMaterialRepository;

    beforeEach(() => {
        repository = new MockMaterialRepository();
        service = new MaterialService(repository);
    });

    it("should throw an error if title is too short", async () => {
        const payload = {
            title: "A", // Invalid length (Must be >= 5 based on our logic)
            fileUrl: "https://example.com/file",
            fileKey: "test-uuid.pdf",
            originalName: "test.pdf",
            mimeType: "application/pdf",
            authorName: "John Doe",
            status: MaterialStatus.UPLOAD_PENDING
        };

        await expect(service.publishMaterial(payload as any)).rejects.toThrow("Title too short");
    });

    it("should create a material successfully", async () => {
        const payload = {
            title: "Valid Title For Material",
            fileUrl: "https://example.com/file",
            fileKey: "test-uuid.pdf",
            originalName: "test.pdf",
            mimeType: "application/pdf",
            authorName: "John Doe",
            status: MaterialStatus.UPLOAD_PENDING
        };

        const result = await service.publishMaterial(payload as any);

        expect(result.id).toBe("1");
        expect(result.title).toBe("Valid Title For Material");
        expect(repository.materials.length).toBe(1);
    });
});