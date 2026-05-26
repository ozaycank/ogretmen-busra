export enum MaterialStatus {
    UPLOAD_PENDING = "UPLOAD_PENDING",
    PROCESSING = "PROCESSING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    ORPHANED = "ORPHANED"
}

export class Material {
    constructor(
        public readonly id: string,
        public title: string,
        public fileUrl: string,
        public fileKey: string,
        public originalName: string,
        public mimeType: string,
        public authorName: string,
        public status: MaterialStatus,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }
}