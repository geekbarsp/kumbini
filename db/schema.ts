import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  maker: text('maker').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  story: text('story').notNull(),
  image: text('image').notNull(),
  price: integer('price').notNull(),
  stock: integer('stock').notNull().default(0),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  email: text('email').notNull(),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  postalCode: text('postal_code').notNull(),
  paymentMethod: text('payment_method').notNull(),
  status: text('status').notNull().default('confirmed'),
  subtotal: integer('subtotal').notNull(),
  shipping: integer('shipping').notNull(),
  total: integer('total').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [index('idx_orders_user_created').on(table.userId, table.createdAt)]);

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull().references(() => products.id),
  productName: text('product_name').notNull(),
  unitPrice: integer('unit_price').notNull(),
  quantity: integer('quantity').notNull(),
}, (table) => [index('idx_order_items_order').on(table.orderId)]);

export const wishlists = sqliteTable('wishlists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  productId: text('product_id').notNull().references(() => products.id),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [uniqueIndex('idx_wishlists_user_product').on(table.userId, table.productId)]);
