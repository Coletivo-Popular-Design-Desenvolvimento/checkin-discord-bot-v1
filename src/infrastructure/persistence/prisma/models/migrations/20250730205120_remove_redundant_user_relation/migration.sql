/*
  Warnings:

  - You are about to drop the column `channelId` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `user_channelId_fkey`;

-- DropIndex
DROP INDEX `user_channelId_fkey` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `channelId`;
