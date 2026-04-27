/*
  Warnings:
  - You are about to drop the `_UserChannel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserRole` table. If the table is not empty, all the data it contains will be lost.
*/

-- Tabelas explícitas
CREATE TABLE `UserChannel` (
    `user_platform_id` VARCHAR(191) NOT NULL,
    `channel_platform_id` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`user_platform_id`, `channel_platform_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `UserRole` (
    `user_platform_id` VARCHAR(191) NOT NULL,
    `role_platform_id` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`user_platform_id`, `role_platform_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Foreign Keys apontando para platform_id
ALTER TABLE `UserChannel` ADD CONSTRAINT `UserChannel_user_platform_id_fkey` FOREIGN KEY (`user_platform_id`) REFERENCES `user`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `UserChannel` ADD CONSTRAINT `UserChannel_channel_platform_id_fkey` FOREIGN KEY (`channel_platform_id`) REFERENCES `channel`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_user_platform_id_fkey` FOREIGN KEY (`user_platform_id`) REFERENCES `user`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_role_platform_id_fkey` FOREIGN KEY (`role_platform_id`) REFERENCES `role`(`platform_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Transferência de Dados
INSERT INTO `UserChannel` (`user_platform_id`, `channel_platform_id`)
SELECT 
    u.`platform_id`, 
    c.`platform_id`
FROM `_UserChannel` old
JOIN `user` u ON old.`B` = u.`id`
JOIN `channel` c ON old.`A` = c.`id`;

INSERT INTO `UserRole` (`user_platform_id`, `role_platform_id`)
SELECT 
    u.`platform_id`, 
    r.`platform_id`
FROM `_UserRole` old
JOIN `user` u ON old.`B` = u.`id`
JOIN `role` r ON old.`A` = r.`id`;

-- Remoção das tabelas antigas
ALTER TABLE `_UserChannel` DROP FOREIGN KEY `_UserChannel_A_fkey`;
ALTER TABLE `_UserChannel` DROP FOREIGN KEY `_UserChannel_B_fkey`;
ALTER TABLE `_UserRole` DROP FOREIGN KEY `_UserRole_A_fkey`;
ALTER TABLE `_UserRole` DROP FOREIGN KEY `_UserRole_B_fkey`;

DROP TABLE `_UserChannel`;
DROP TABLE `_UserRole`;
