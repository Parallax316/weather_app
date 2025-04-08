import { Lightbulb, Shirt, Sparkles } from "lucide-react"
import ReactMarkdown from 'react-markdown'

interface AIInsightsProps {
  summary?: string | null
  activities?: string | null
  clothing?: string | null
}

export default function AIInsights({ summary, activities, clothing }: AIInsightsProps) {
  if (!activities && !clothing) return null

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800 dark:text-white">
        <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
        AI Weather Insights
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activities && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 rounded-lg p-5 border border-purple-200 dark:border-purple-800/30">
            <h3 className="text-lg font-medium mb-3 flex items-center text-purple-700 dark:text-purple-400">
              <Lightbulb className="h-5 w-5 mr-2" />
              Activity Suggestions
            </h3>
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:text-foreground/80 prose-strong:text-foreground">
              <ReactMarkdown>{activities}</ReactMarkdown>
            </div>
          </div>
        )}

        {clothing && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-lg p-5 border border-blue-200 dark:border-blue-800/30">
            <h3 className="text-lg font-medium mb-3 flex items-center text-blue-700 dark:text-blue-400">
              <Shirt className="h-5 w-5 mr-2" />
              Clothing Advice
            </h3>
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:text-foreground/80 prose-strong:text-foreground">
              <ReactMarkdown>{clothing}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

