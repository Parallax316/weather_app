"use client"

import { Download } from "lucide-react"

interface ExportOptionsProps {
  onExport: (format: "json" | "csv") => void
}

export default function ExportOptions({ onExport }: ExportOptionsProps) {
  return (
    <div className="mt-6 mb-6 pb-6 border-b border-gray-200/30 dark:border-gray-700/30">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white flex items-center">
        <Download className="h-5 w-5 mr-2 text-blue-500" />
        Export Weather Data
      </h3>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onExport("json")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center transition-colors duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          Export as JSON
        </button>

        <button
          onClick={() => onExport("csv")}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center transition-colors duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          Export as CSV
        </button>
      </div>
    </div>
  )
}

