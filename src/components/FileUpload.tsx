import { useCallback } from "react";

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  isUploading: boolean;
}

export function FileUpload({ onFileUpload, isUploading }: FileUploadProps) {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    onFileUpload(files);
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onFileUpload(files);
    }
  }, [onFileUpload]);

  return (
    <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-primary transition-colors">
      <div
        className="p-8 text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upload Excel Files
          </h3>
          <p className="text-gray-600 mb-4">
            Drag and drop your Excel files here, or click to select files
          </p>
          <p className="text-sm text-gray-500">
            Supports .xlsx and .xls files
          </p>
        </div>

        <div className="space-y-4">
          <label className="inline-block">
            <input
              type="file"
              multiple
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
            />
            <span className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                "Select Files"
              )}
            </span>
          </label>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <h4 className="font-medium mb-2">Processing Details:</h4>
          <ul className="text-left space-y-1 max-w-md mx-auto">
            <li>• Header row remains unchanged</li>
            <li>• Every 2 consecutive rows are averaged</li>
            <li>• Multiple sheets are supported</li>
            <li>• Non-numeric values are handled gracefully</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
