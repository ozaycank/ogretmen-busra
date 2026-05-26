import { Material, MaterialStatus } from "../entities/material.entity";

export interface IMaterialRepository {
    findById(id: string): Promise<Material | null>;
    findAll(limit: number, offset: number): Promise<Material[]>;
    // id, createdAt ve updatedAt veritabanı tarafından otomatik atanır
    create(material: Omit<Material, "id" | "createdAt" | "updatedAt">): Promise<Material>;
    updateStatus(id: string, status: MaterialStatus): Promise<void>;
}