"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import * as XLSX from "xlsx";

export const processExcelFile = action({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    try {
      // Update status to processing
      await ctx.runMutation(api.files.updateFileStatus, {
        fileId: args.fileId,
        status: "processing",
      });

      // Get file info
      const files = await ctx.runQuery(api.files.getUserFiles, {});
      const file = files.find(f => f._id === args.fileId);
      
      if (!file || !file.originalUrl) {
        throw new Error("File not found");
      }

      // Download the file
      const response = await fetch(file.originalUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      // Parse Excel file
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const processedWorkbook = XLSX.utils.book_new();
      const sheetsInfo = [];

      // Process each sheet
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, 
          defval: null,
          raw: false 
        });

        if (jsonData.length < 3) {
          // Not enough rows to process (need header + at least 2 data rows)
          XLSX.utils.book_append_sheet(processedWorkbook, worksheet, sheetName);
          sheetsInfo.push({
            name: sheetName,
            originalRows: jsonData.length,
            processedRows: jsonData.length,
          });
          continue;
        }

        const processedData = processSheet(jsonData as any[][]);
        
        // Convert back to worksheet
        const newWorksheet = XLSX.utils.aoa_to_sheet(processedData);
        XLSX.utils.book_append_sheet(processedWorkbook, newWorksheet, sheetName);
        
        sheetsInfo.push({
          name: sheetName,
          originalRows: jsonData.length,
          processedRows: processedData.length,
        });
      }

      // Generate processed file
      const processedBuffer = XLSX.write(processedWorkbook, { 
        type: 'buffer', 
        bookType: 'xlsx' 
      });

      // Upload processed file
      const uploadUrl = await ctx.runMutation(api.files.generateUploadUrl, {});
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
        body: processedBuffer,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload processed file");
      }

      const { storageId } = await uploadResponse.json();

      // Update file status
      await ctx.runMutation(api.files.updateFileStatus, {
        fileId: args.fileId,
        status: "completed",
        processedStorageId: storageId,
        sheets: sheetsInfo,
      });

    } catch (error) {
      console.error("Processing error:", error);
      await ctx.runMutation(api.files.updateFileStatus, {
        fileId: args.fileId,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
});

function processSheet(data: any[][]): any[][] {
  if (data.length < 3) return data;

  const header = data[0];
  const dataRows = data.slice(1);
  const processedRows = [header]; // Keep original header without Row Mean column

  // Process pairs of rows
  for (let i = 0; i < dataRows.length; i += 2) {
    if (i + 1 < dataRows.length) {
      // We have a pair
      const row1 = dataRows[i];
      const row2 = dataRows[i + 1];
      const meanRow = calculateRowMean(row1, row2, header.length);
      processedRows.push(meanRow);
    } else {
      // Odd row at the end, keep as is without row mean
      const singleRow = [...dataRows[i]];
      // Ensure the row has the same length as header
      while (singleRow.length < header.length) {
        singleRow.push("");
      }
      processedRows.push(singleRow.slice(0, header.length));
    }
  }

  return processedRows;
}

function calculateRowMean(row1: any[], row2: any[], originalColumnCount: number): any[] {
  const maxLength = Math.max(row1.length, row2.length, originalColumnCount);
  const meanRow = new Array(maxLength); // No extra column for Row Mean

  for (let i = 0; i < maxLength; i++) {
    const val1 = row1[i];
    const val2 = row2[i];
    
    const num1 = parseNumeric(val1);
    const num2 = parseNumeric(val2);
    
    if (num1 !== null && num2 !== null) {
      const mean = (num1 + num2) / 2;
      meanRow[i] = mean;
    } else if (num1 !== null) {
      meanRow[i] = num1;
    } else if (num2 !== null) {
      meanRow[i] = num2;
    } else {
      // Both are non-numeric, use the first non-empty value
      meanRow[i] = val1 || val2 || "";
    }
  }


  
  return meanRow;
}



function parseNumeric(value: any): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  
  const num = Number(value);
  return isNaN(num) ? null : num;
}
