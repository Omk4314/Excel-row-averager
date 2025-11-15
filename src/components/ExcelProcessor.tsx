import { useState, useCallback } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { FileUpload } from "./FileUpload";
import { FileList } from "./FileList";
import { ProcessingProgress } from "./ProcessingProgress";

export function ExcelProcessor() {
  const [isUploading, setIsUploading] = useState(false);
  const files = useQuery(api.files.getUserFiles) || [];
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createFile = useMutation(api.files.createFile);
  const processFile = useAction(api.processor.processExcelFile);

  const handleFileUpload = useCallback(async (selectedFiles: File[]) => {
    setIsUploading(true);
    
    try {
      for (const file of selectedFiles) {
        // Validate file type
        if (!file.name.match(/\.(xlsx?|xls)$/i)) {
          toast.error(`${file.name} is not a valid Excel file`);
          continue;
        }

        // Generate upload URL
        const uploadUrl = await generateUploadUrl();
        
        // Upload file
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const { storageId } = await uploadResponse.json();

        // Create file record
        const fileId = await createFile({
          originalName: file.name,
          storageId,
        });

        toast.success(`${file.name} uploaded successfully`);

        // Start processing
        processFile({ fileId }).catch((error) => {
          console.error("Processing error:", error);
          toast.error(`Failed to process ${file.name}`);
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  }, [generateUploadUrl, createFile, processFile]);

  const processingFiles = files.filter(f => f.status === "processing");
  const completedFiles = files.filter(f => f.status === "completed");
  const errorFiles = files.filter(f => f.status === "error");

  return (
    <div className="space-y-8">
      <FileUpload onFileUpload={handleFileUpload} isUploading={isUploading} />
      
      {processingFiles.length > 0 && (
        <ProcessingProgress files={processingFiles} />
      )}
      
      <FileList 
        files={files}
        title="All Files"
        showStatus={true}
      />
      
      {files.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No files uploaded yet</p>
          <p className="text-sm">Upload Excel files to get started</p>
        </div>
      )}
    </div>
  );
}
