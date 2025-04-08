import { AlertCircle } from "lucide-react"

interface ErrorAlertProps {
  message: string
  className?: string
}

export default function ErrorAlert({ message, className = "" }: ErrorAlertProps) {
  return (
    <div
      className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-md flex items-start ${className}`}
    >
      <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
      <p>{message}</p>
    </div>
  )
}

