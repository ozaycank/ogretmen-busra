/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Material` will be added. If there are existing duplicate values, this will fail.
  - Made the column `slug` on table `Material` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Material_status_grade_category_idx";

-- AlterTable
ALTER TABLE "Material" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Material_slug_key" ON "Material"("slug");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
