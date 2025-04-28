-- CreateTable
CREATE TABLE `Job` (
    `id` VARCHAR(191) NOT NULL,
    `learningRate` DOUBLE NOT NULL,
    `batchSize` INTEGER NOT NULL,
    `epoch` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `accuracy` DOUBLE NULL,
    `duration` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Log` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `epoch` INTEGER NOT NULL,
    `trainLoss` DOUBLE NOT NULL,
    `valLoss` DOUBLE NOT NULL,
    `accuracy` DOUBLE NOT NULL,
    `time` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
