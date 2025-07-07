-- CreateTable
CREATE TABLE `user_channel` (
    `user_id` VARCHAR(191) NOT NULL,
    `channel_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`user_id`, `channel_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_channel` ADD CONSTRAINT `user_channel_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_channel` ADD CONSTRAINT `user_channel_channel_id_fkey` FOREIGN KEY (`channel_id`) REFERENCES `channel`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
