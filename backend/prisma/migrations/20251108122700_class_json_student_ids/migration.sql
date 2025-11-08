/*
  Warnings:

  - You are about to drop the column `student_id` on the `class` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `class` DROP FOREIGN KEY `Class_student_id_fkey`;

-- AlterTable
ALTER TABLE `class` DROP COLUMN `student_id`;
