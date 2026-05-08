-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `salons` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `visibility` ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC',
    `ownerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `salons_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `salon_members` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `salonId` VARCHAR(191) NOT NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `salon_members_userId_idx`(`userId`),
    INDEX `salon_members_salonId_idx`(`salonId`),
    UNIQUE INDEX `salon_members_userId_salonId_key`(`userId`, `salonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `salonId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `messages_authorId_idx`(`authorId`),
    INDEX `messages_salonId_idx`(`salonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Friendship` (
    `id` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `receiverId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Friendship_senderId_receiverId_key`(`senderId`, `receiverId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `salons` ADD CONSTRAINT `salons_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `salon_members` ADD CONSTRAINT `salon_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `salon_members` ADD CONSTRAINT `salon_members_salonId_fkey` FOREIGN KEY (`salonId`) REFERENCES `salons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_salonId_fkey` FOREIGN KEY (`salonId`) REFERENCES `salons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friendship` ADD CONSTRAINT `Friendship_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friendship` ADD CONSTRAINT `Friendship_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
