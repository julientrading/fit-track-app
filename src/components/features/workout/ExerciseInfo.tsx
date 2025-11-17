import { Play } from 'lucide-react'

interface ExerciseInfoProps {
  name: string
  category: string
  muscleGroup: string
  videoUrl?: string | null
  onWatchVideo?: () => void
}

export const ExerciseInfo = ({
  name,
  category,
  muscleGroup,
  videoUrl,
  onWatchVideo,
}: ExerciseInfoProps) => {
  return (
    <div>
      {/* Exercise Image/Video Placeholder */}
      <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl h-48 flex items-center justify-center mb-4 relative overflow-hidden shadow-lg">
        <Play className="w-24 h-24 text-white opacity-50" />
        {videoUrl && (
          <button
            onClick={onWatchVideo}
            className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-white/30 transition"
          >
            Watch Form Video
          </button>
        )}
      </div>

      {/* Exercise Name */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{name}</h2>

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
          {category}
        </span>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
          {muscleGroup}
        </span>
      </div>
    </div>
  )
}
