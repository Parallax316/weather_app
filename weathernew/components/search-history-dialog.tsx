"use client"

import { useState } from "react"
import { Clock, Eye, Trash2, Edit, X } from "lucide-react"
import LoadingSpinner from "./loading-spinner"

interface SearchHistoryDialogProps {
  open: boolean
  onClose: () => void
  history: any[]
  loading: boolean
  onViewItem: (id: string) => void
  onDeleteItem: (id: string) => void
  onEditItem: (item: any) => void
  onDeleteMultiple: (ids: string[]) => void
}

export default function SearchHistoryDialog({
  open,
  onClose,
  history,
  loading,
  onViewItem,
  onDeleteItem,
  onEditItem,
  onDeleteMultiple,
}: SearchHistoryDialogProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === history.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(history.map((item) => item.id))
    }
  }

  const handleDeleteSelected = () => {
    onDeleteMultiple(selectedItems)
    setSelectedItems([])
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Search History</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="select-all"
              checked={selectedItems.length === history.length && history.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="select-all" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Select All
            </label>
          </div>

          {selectedItems.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected ({selectedItems.length})
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No search history found</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="py-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="px-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {item.city}, {item.state}, {item.country}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(item.timestamp)}
                    </p>
                  </div>

                  <div className="flex space-x-1 px-3">
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
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

