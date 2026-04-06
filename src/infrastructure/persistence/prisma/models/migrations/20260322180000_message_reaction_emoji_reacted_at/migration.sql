-- Drop Foreign Key
ALTER TABLE `message_reaction` DROP FOREIGN KEY `message_reaction_user_id_fkey`;

-- Drop Index
DROP INDEX `message_reaction_user_id_message_id_key` ON `message_reaction`;

-- Alter Table
ALTER TABLE `message_reaction` ADD COLUMN `reacted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `reaction_emoji` VARCHAR(191) NULL DEFAULT '';

-- Create Index
CREATE UNIQUE INDEX `message_reaction_user_id_message_id_reaction_emoji_key` ON `message_reaction`(`user_id`, `message_id`, `reaction_emoji`);

-- Add ForeignKey
ALTER TABLE `message_reaction` ADD CONSTRAINT `message_reaction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
