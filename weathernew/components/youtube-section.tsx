import { Play } from "lucide-react";

interface YoutubeVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
}

interface YoutubeSectionProps {
  videos: YoutubeVideo[];
}

export default function YoutubeSection({ videos }: YoutubeSectionProps) {
  if (!videos || videos.length === 0) {
    return null; // Don't render anything if there are no videos
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800 dark:text-white">
        <Play className="h-5 w-5 text-red-500 mr-2" />
        Related Videos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <a
            key={video.videoId}
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank" // Open in new tab
            rel="noopener noreferrer" // Security best practice
            className="block group border border-gray-200/30 dark:border-gray-700/30 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-white/80 dark:bg-gray-800/80"
          >
            <div className="relative">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Play className="h-10 w-10 text-white fill-white" />
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                {video.title}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}