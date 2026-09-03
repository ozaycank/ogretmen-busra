-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('UPLOAD_PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'ORPHANED');

-- CreateEnum
CREATE TYPE "GradeLevel" AS ENUM ('OKUL_ONCESI', 'SINIF_1', 'SINIF_2', 'SINIF_3', 'SINIF_4', 'GENEL');

-- CreateEnum
CREATE TYPE "SubjectType" AS ENUM ('TUM_DERSLER', 'TURKCE', 'MATEMATIK', 'HAYAT_BILGISI', 'FEN_BILIMLERI', 'SOSYAL_BILGILER', 'INGILIZCE', 'DIN_KULTURU', 'GORSEL_SANATLAR', 'MUZIK', 'BEDEN_EGITIMI', 'BILISIM', 'SERBEST_ETKINLIK', 'REHBERLIK', 'DIL_VE_KONUSMA', 'MOTOR_GELISIM');

-- CreateEnum
CREATE TYPE "ContentCategory" AS ENUM ('ETKINLIK', 'ODEV', 'KONU_ANLATIMI', 'KODLAMA', 'BELIRLI_GUN_VE_HAFTALAR', 'UZMAN_NOTLARI', 'SINIF_MATERYALLERI', 'PIKTES_TURKCE', 'DEGERLER_EGITIMI', 'INTERAKTIF_OYUN');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MODERATOR', 'USER');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'ACCOUNT_LOCKED', 'MATERIAL_APPROVED', 'MATERIAL_REJECTED', 'MATERIAL_DELETED');

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(255),
    "description" VARCHAR(500),
    "fileKey" VARCHAR(255) NOT NULL,
    "originalName" VARCHAR(255) NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" VARCHAR(10) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "authorName" VARCHAR(100) NOT NULL,
    "status" "FileStatus" NOT NULL DEFAULT 'UPLOAD_PENDING',
    "scanResult" TEXT,
    "grade" "GradeLevel" NOT NULL,
    "subject" "SubjectType" NOT NULL DEFAULT 'TUM_DERSLER',
    "category" "ContentCategory" NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "ipHash" VARCHAR(64) NOT NULL,
    "turnstileToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "label" VARCHAR(50) NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" VARCHAR(60),
    "seoDescription" VARCHAR(160),
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteStats" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "online" INTEGER NOT NULL DEFAULT 0,
    "today" INTEGER NOT NULL DEFAULT 0,
    "yesterday" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SiteStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "ipAddress" VARCHAR(64),
    "userAgent" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "SettingHistory" (
    "id" TEXT NOT NULL,
    "settingKey" VARCHAR(100) NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB NOT NULL,
    "changedBy" TEXT NOT NULL,
    "reason" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Material_fileKey_key" ON "Material"("fileKey");

-- CreateIndex
CREATE UNIQUE INDEX "Material_turnstileToken_key" ON "Material"("turnstileToken");

-- CreateIndex
CREATE INDEX "Material_status_grade_category_idx" ON "Material"("status", "grade", "category");

-- CreateIndex
CREATE INDEX "Material_status_grade_subject_category_idx" ON "Material"("status", "grade", "subject", "category");

-- CreateIndex
CREATE INDEX "Material_ipHash_createdAt_idx" ON "Material"("ipHash", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

-- CreateIndex
CREATE INDEX "News_status_publishedAt_idx" ON "News"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "News_slug_idx" ON "News"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SiteStats_date_key" ON "SiteStats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AuditLog_userId_action_createdAt_idx" ON "AuditLog"("userId", "action", "createdAt");

-- CreateIndex
CREATE INDEX "SettingHistory_settingKey_createdAt_idx" ON "SettingHistory"("settingKey", "createdAt");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

