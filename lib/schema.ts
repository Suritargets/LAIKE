import { pgTable, serial, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  message: text("message"),
  category: varchar("category", { length: 20 }).notNull(), // "early_access" | "demo" | "donate"
  amount: integer("amount"), // cents, for donations
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
