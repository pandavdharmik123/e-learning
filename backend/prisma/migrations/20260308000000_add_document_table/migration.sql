-- CreateTable
CREATE TABLE IF NOT EXISTS `Document` (
    `document_id` INTEGER NOT NULL AUTO_INCREMENT,
    `teacher_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `file_url` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `student_ids` JSON NOT NULL DEFAULT ('[]'),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`document_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `DocumentRead` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `document_id` INTEGER NOT NULL,
    `student_id` INTEGER NOT NULL,
    `read_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DocumentRead_document_id_student_id_key`(`document_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `Teacher`(`teacher_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentRead` ADD CONSTRAINT `DocumentRead_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `Document`(`document_id`) ON DELETE CASCADE ON UPDATE CASCADE;
