import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface FileListProps {
  files: Array<{
    _id: Id<"files">;
    originalName: string;
    status: "uploading" | "processing" | "completed" | "error";
    errorMessage?: string;
    sheets?: Array<{
      name: string;
      originalRows: number;
      processedRows: number;
    }>;
    processedUrl?: string | null;
    uploadedAt: number;
  }>;
  title: string;
  showStatus?: boolean;
}

export function FileList({ files, title, showStatus = false }: FileListProps) {
  const deleteFile = useMutation(api.files.deleteFile);

  const handleDelete = async (fileId: Id<"files">) => {
    try {
      await deleteFile({ fileId });
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete file");
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `processed_${filename}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="divide-y">
        {files.map((file) => (
          <div key={file._id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.originalName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Uploaded {new Date(file.uploadedAt).toLocaleString()}
                    </p>
                    
                    {showStatus && (
                      <div className="mt-1">
                        <StatusBadge status={file.status} />
                        {file.errorMessage && (
                          <p className="text-sm text-red-600 mt-1">{file.errorMessage}</p>
                        )}
                      </div>
                    )}
                    
                    {file.sheets && file.sheets.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Sheets processed:</p>
                        <div className="space-y-1">
                          {file.sheets.map((sheet, index) => (
                            <div key={index} className="text-xs text-gray-600">
                              <span className="font-medium">{sheet.name}:</span> {sheet.originalRows} → {sheet.processedRows} rows
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {file.status === "completed" && file.processedUrl && (
                  <button
                    onClick={() => handleDownload(file.processedUrl!, file.originalName)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(file._id)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    uploading: { color: "bg-blue-100 text-blue-800", text: "Uploading" },
    processing: { color: "bg-yellow-100 text-yellow-800", text: "Processing" },
    completed: { color: "bg-green-100 text-green-800", text: "Completed" },
    error: { color: "bg-red-100 text-red-800", text: "Error" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.error;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
}
