-- DropForeignKey
ALTER TABLE `Log` DROP FOREIGN KEY `Log_jobId_fkey`;

-- DropIndex
DROP INDEX `Log_jobId_fkey` ON `Log`;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
