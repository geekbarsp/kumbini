CREATE INDEX `idx_order_items_order` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_user_created` ON `orders` (`user_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_wishlists_user_product` ON `wishlists` (`user_id`,`product_id`);