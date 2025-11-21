interface LatestAchievementProps {
  emoji: string
  name: string
  description: string
  nextAchievement: string
  progress: number
  goal: number
  progressPercentage: number
}

export const LatestAchievement = ({
  emoji,
  name,
  description,
  nextAchievement,
  progress,
  goal,
  progressPercentage,
}: LatestAchievementProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Latest Achievement</h2>
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 shadow-lg text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-6xl">{emoji}</div>
          <div>
            <h3 className="text-2xl font-bold mb-1">{name}</h3>
            <p className="text-sm opacity-90">{description}</p>
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold">Next: {nextAchievement}</span>
            <span className="font-bold">
              {progress}/{goal} days
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
