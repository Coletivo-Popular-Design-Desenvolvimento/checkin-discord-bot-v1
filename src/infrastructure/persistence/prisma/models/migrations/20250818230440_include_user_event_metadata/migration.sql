/*
  Warnings:

  - The primary key for the `user_event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `event_type` to the `user_event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `user_event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user_event` DROP PRIMARY KEY,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `event_type` ENUM('JOINED', 'LEFT') NOT NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);
