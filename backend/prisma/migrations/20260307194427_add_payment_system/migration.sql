-- CreateEnum
CREATE TABLE IF NOT EXISTS `_PaymentStatus` (
    `value` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`value`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `_PaymentStatus` (`value`) VALUES ('PENDING'), ('SUCCESS'), ('FAILED');

-- CreateTable
CREATE TABLE IF NOT EXISTS `Payment` (
    `payment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `teacher_id` INTEGER NOT NULL,
    `razorpay_order_id` VARCHAR(191) NOT NULL,
    `razorpay_payment_id` VARCHAR(191) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `payment_method` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_razorpay_order_id_key`(`razorpay_order_id`),
    INDEX `Payment_user_id_idx`(`user_id`),
    INDEX `Payment_teacher_id_idx`(`teacher_id`),
    INDEX `Payment_razorpay_order_id_idx`(`razorpay_order_id`),
    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `Teacher`(`teacher_id`) ON DELETE CASCADE ON UPDATE CASCADE;
