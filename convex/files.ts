import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createFile = mutation({
  args: {
    originalName: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", {
      originalName: args.originalName,
      storageId: args.storageId,
      status: "uploading",
      uploadedAt: Date.now(),
    });
  },
});

export const getUserFiles = query({
  args: {},
  handler: async (ctx) => {
    const files = await ctx.db
      .query("files")
      .order("desc")
      .collect();

    return Promise.all(
      files.map(async (file) => ({
        ...file,
        originalUrl: await ctx.storage.getUrl(file.storageId),
        processedUrl: file.processedStorageId 
          ? await ctx.storage.getUrl(file.processedStorageId)
          : null,
      }))
    );
  },
});

export const updateFileStatus = mutation({
  args: {
    fileId: v.id("files"),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("error")),
    errorMessage: v.optional(v.string()),
    processedStorageId: v.optional(v.id("_storage")),
    sheets: v.optional(v.array(v.object({
      name: v.string(),
      originalRows: v.number(),
      processedRows: v.number(),
    }))),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    await ctx.db.patch(args.fileId, {
      status: args.status,
      errorMessage: args.errorMessage,
      processedStorageId: args.processedStorageId,
      sheets: args.sheets,
    });
  },
});

export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Delete storage files
    await ctx.storage.delete(file.storageId);
    if (file.processedStorageId) {
      await ctx.storage.delete(file.processedStorageId);
    }

    await ctx.db.delete(args.fileId);
  },
});
