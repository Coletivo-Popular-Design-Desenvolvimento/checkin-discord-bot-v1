/*
  Warnings:

  - You are about to drop the column `discord_id` on the `channel` table. All the data in the column will be lost.
  - You are about to drop the column `discord_created_at` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `discord_id` on the `message` table. All the data in the column will be lost.
  - The primary key for the `message_reaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `discord_created_at` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `discord_id` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `discord_created_at` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `discord_id` on the `user` table. All the data in the column will be lost.
  - The primary key for the `user_event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[platform_id]` on the table `audio_event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[platform_id]` on the table `channel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[platform_id]` on the table `event_status` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[platform_id]` on the table `message` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[platform_id]` on the table `role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[platform_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `platform_id` to the `audio_event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform_id` to the `channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform_id` to the `event_status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform_created_at` to the `message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform_id` to the `message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform_created_at` to the `role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform_id` to the `role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `audio_event` DROP FOREIGN KEY `audio_event_channel_id_fkey`;

-- DropForeignKey
ALTER TABLE `audio_event` DROP FOREIGN KEY `audio_event_creator_id_fkey`;

-- DropForeignKey
ALTER TABLE `audio_event` DROP FOREIGN KEY `audio_event_status_id_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `message_channel_id_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `message_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `message_reaction` DROP FOREIGN KEY `message_reaction_channel_id_fkey`;

-- DropForeignKey
ALTER TABLE `message_reaction` DROP FOREIGN KEY `message_reaction_message_id_fkey`;

-- DropForeignKey
ALTER TABLE `message_reaction` DROP FOREIGN KEY `message_reaction_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_event` DROP FOREIGN KEY `user_event_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_event` DROP FOREIGN KEY `user_event_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_role` DROP FOREIGN KEY `user_role_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `user_role` DROP FOREIGN KEY `user_role_user_id_fkey`;

-- DropIndex
DROP INDEX `audio_event_channel_id_fkey` ON `audio_event`;

-- DropIndex
DROP INDEX `audio_event_creator_id_fkey` ON `audio_event`;

-- DropIndex
DROP INDEX `audio_event_status_id_fkey` ON `audio_event`;

-- DropIndex
DROP INDEX `message_channel_id_fkey` ON `message`;

-- DropIndex
DROP INDEX `message_user_id_fkey` ON `message`;

-- DropIndex
DROP INDEX `message_reaction_channel_id_fkey` ON `message_reaction`;

-- DropIndex
DROP INDEX `message_reaction_message_id_fkey` ON `message_reaction`;

-- DropIndex
DROP INDEX `user_discord_id_key` ON `user`;

-- DropIndex
DROP INDEX `user_event_event_id_fkey` ON `user_event`;

-- DropIndex
DROP INDEX `user_role_roleId_fkey` ON `user_role`;

-- AlterTable
ALTER TABLE `audio_event` ADD COLUMN `platform_id` VARCHAR(191) NOT NULL,
    MODIFY `channel_id` VARCHAR(191) NOT NULL,
    MODIFY `creator_id` VARCHAR(191) NOT NULL,
    MODIFY `status_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `channel` DROP COLUMN `discord_id`,
    ADD COLUMN `platform_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `event_status` ADD COLUMN `platform_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `message` DROP COLUMN `discord_created_at`,
    DROP COLUMN `discord_id`,
    ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `platform_created_at` DATETIME(3) NOT NULL,
    ADD COLUMN `platform_id` VARCHAR(191) NOT NULL,
    MODIFY `channel_id` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `message_reaction` DROP PRIMARY KEY,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    MODIFY `message_id` VARCHAR(191) NOT NULL,
    MODIFY `channel_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`user_id`, `message_id`);

-- AlterTable
ALTER TABLE `role` DROP COLUMN `discord_created_at`,
    DROP COLUMN `discord_id`,
    ADD COLUMN `platform_created_at` DATETIME(3) NOT NULL,
    ADD COLUMN `platform_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `discord_created_at`,
    DROP COLUMN `discord_id`,
    ADD COLUMN `platform_created_at` DATETIME(3) NULL,
    ADD COLUMN `platform_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user_event` DROP PRIMARY KEY,
    MODIFY `event_id` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`user_id`, `event_id`);

-- AlterTable
ALTER TABLE `user_role` DROP PRIMARY KEY,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    MODIFY `roleId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`user_id`, `roleId`);

-- CreateIndex
CREATE UNIQUE INDEX `audio_event_platform_id_key` ON `audio_event`(`platform_id`);

-- CreateIndex
CREATE UNIQUE INDEX `channel_platform_id_key` ON `channel`(`platform_id`);

-- CreateIndex
CREATE UNIQUE INDEX `event_status_platform_id_key` ON `event_status`(`platform_id`);

-- CreateIndex
CREATE UNIQUE INDEX `message_platform_id_key` ON `message`(`platform_id`);

-- CreateIndex
CREATE UNIQUE INDEX `role_platform_id_key` ON `role`(`platform_id`);

-- CreateIndex
CREATE UNIQUE INDEX `user_platform_id_key` ON `user`(`platform_id`);

-- AddForeignKey
ALTER TABLE `user_role` ADD CONSTRAINT `user_role_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_role` ADD CONSTRAINT `user_role_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audio_event` ADD CONSTRAINT `audio_event_channel_id_fkey` FOREIGN KEY (`channel_id`) REFERENCES `channel`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audio_event` ADD CONSTRAINT `audio_event_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `user`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audio_event` ADD CONSTRAINT `audio_event_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `event_status`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_event` ADD CONSTRAINT `user_event_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `audio_event`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_event` ADD CONSTRAINT `user_event_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_channel_id_fkey` FOREIGN KEY (`channel_id`) REFERENCES `channel`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_reaction` ADD CONSTRAINT `message_reaction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_reaction` ADD CONSTRAINT `message_reaction_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `message`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_reaction` ADD CONSTRAINT `message_reaction_channel_id_fkey` FOREIGN KEY (`channel_id`) REFERENCES `channel`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
