import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { ExcelProcessor } from "./components/ExcelProcessor";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-center items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-primary">Excel Processor</h2>
      </header>
      <main className="flex-1 p-8">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Excel File Processor</h1>
        <p className="text-xl text-secondary">
          Upload Excel files to calculate grouped means and add row averages
        </p>
      </div>
      <ExcelProcessor />
    </div>
  );
}
