"use client"

import { Clock, Eye, Trash2, Edit } from "lucide-react"
import LoadingSpinner from "./loading-spinner"

interface SearchHistoryProps {
  history: any[]
  loading: boolean
  onViewItem: (id: string) => void
  onDeleteItem: (id: string) => void
  onEditItem: (item: any) => void
  limitItems?: boolean
}

export default function SearchHistory({
  history,
  loading,
  onViewItem,
  onDeleteItem,
  onEditItem,
  limitItems = false,
}: SearchHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
          <p>No recent searches</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {history.map((item) => (
            <li
              key={item.id}
              className="border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-4 bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    {item.city}, {item.state}, {item.country}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(item.timestamp)}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewItem(item.id)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onEditItem(item)}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

