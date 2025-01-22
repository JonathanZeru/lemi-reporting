/*
  Warnings:

  - You are about to drop the `reportvideo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `reportvideo` DROP FOREIGN KEY `ReportVideo_reportId_fkey`;

-- AlterTable
ALTER TABLE `report` ADD COLUMN `reportVideo` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `reportvideo`;
