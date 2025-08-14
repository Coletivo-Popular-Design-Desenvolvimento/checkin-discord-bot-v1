-- AlterTable
ALTER TABLE `user` ADD COLUMN `channelId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `channel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
