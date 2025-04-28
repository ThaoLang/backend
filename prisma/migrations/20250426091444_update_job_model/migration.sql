-- AlterTable
ALTER TABLE `Job` ADD COLUMN `endAt` DATETIME(3) NULL,
    ADD COLUMN `finalAccuracy` DOUBLE NULL,
    ADD COLUMN `finalLoss` DOUBLE NULL;
