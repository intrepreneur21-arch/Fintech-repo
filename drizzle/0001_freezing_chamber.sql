CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paymentPageId` int NOT NULL,
	`userId` int NOT NULL,
	`phone` varchar(20),
	`email` varchar(320),
	`name` varchar(255),
	`razorpayCustomerId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` int NOT NULL,
	`userId` int NOT NULL,
	`customerId` int NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`amount` int NOT NULL,
	`pdfStorageKey` varchar(255),
	`status` enum('draft','sent','viewed','paid') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `paymentPages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`description` text,
	`isRecurring` int NOT NULL DEFAULT 0,
	`billingInterval` varchar(32),
	`contactFields` varchar(50) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`razorpayPlanId` varchar(128),
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentPages_id` PRIMARY KEY(`id`),
	CONSTRAINT `paymentPages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paymentPageId` int NOT NULL,
	`customerId` int NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'INR',
	`razorpayPaymentId` varchar(128) NOT NULL,
	`razorpayOrderId` varchar(128),
	`status` enum('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_razorpayPaymentId_unique` UNIQUE(`razorpayPaymentId`)
);
--> statement-breakpoint
CREATE TABLE `usageTracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pagesCreatedThisMonth` int NOT NULL DEFAULT 0,
	`transactionsThisMonth` int NOT NULL DEFAULT 0,
	`currentMonth` varchar(7) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `usageTracking_id` PRIMARY KEY(`id`),
	CONSTRAINT `usageTracking_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `planTier` enum('free','starter','pro') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `razorpayCustomerId` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `razorpaySubscriptionId` varchar(128);