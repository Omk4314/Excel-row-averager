import { Id } from "../../convex/_generated/dataModel";

interface ProcessingProgressProps {
  files: Array<{
    _id: Id<"files">;
    originalName: string;
    status: "uploading" | "processing" | "completed" | "error";
  }>;
}

export function ProcessingProgress({ files }: ProcessingProgressProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Processing Files</h3>
      </div>
      
      <div className="p-6 space-y-4">
        {files.map((file) => (
          <div key={file._id} className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
