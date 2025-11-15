import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  files: defineTable({
    originalName: v.string(),
    storageId: v.id("_storage"),
    processedStorageId: v.optional(v.id("_storage")),
    status: v.union(v.literal("uploading"), v.literal("processing"), v.literal("completed"), v.literal("error")),
    errorMessage: v.optional(v.string()),
    sheets: v.optional(v.array(v.object({
      name: v.string(),
      originalRows: v.number(),
      processedRows: v.number(),
    }))),
    uploadedAt: v.number(),
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
