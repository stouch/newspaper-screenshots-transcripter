-- CreateTable
CREATE TABLE `Newspaper` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NewspaperPage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `fileUrl` VARCHAR(255) NOT NULL,
    `width` INTEGER NOT NULL DEFAULT 400,
    `height` INTEGER NOT NULL DEFAULT 600,
    `x` INTEGER NOT NULL,
    `y` INTEGER NOT NULL,
    `uploadDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `newspaperId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TranscriptBox` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `x` INTEGER NOT NULL,
    `y` INTEGER NOT NULL,
    `width` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'en',
    `text` VARCHAR(191) NULL,
    `newspaperPageId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TranscriptBoxTranslation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `language` CHAR(2) NOT NULL,
    `translationText` VARCHAR(191) NOT NULL,
    `transcriptBoxId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TranscriptBoxTranslation_transcriptBoxId_language_key`(`transcriptBoxId`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NewspaperPage` ADD CONSTRAINT `NewspaperPage_newspaperId_fkey` FOREIGN KEY (`newspaperId`) REFERENCES `Newspaper`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TranscriptBox` ADD CONSTRAINT `TranscriptBox_newspaperPageId_fkey` FOREIGN KEY (`newspaperPageId`) REFERENCES `NewspaperPage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TranscriptBoxTranslation` ADD CONSTRAINT `TranscriptBoxTranslation_transcriptBoxId_fkey` FOREIGN KEY (`transcriptBoxId`) REFERENCES `TranscriptBox`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
