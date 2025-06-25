/*
  Warnings:

  - The primary key for the `message_reaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[user_id,message_id]` on the table `message_reaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `message_reaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `message_reaction` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `message_reaction_user_id_message_id_key` ON `message_reaction`(`user_id`, `message_id`);
