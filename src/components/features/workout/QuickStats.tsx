import { Zap, Clock, Award, TrendingUp } from 'lucide-react'

interface QuickStatsProps {
  workouts: number
  workoutsChange: string
  totalTime: string
  avgTime: string
  personalRecords: number
  xpEarned: number
  level: number
  levelProgress: number
}

export const QuickStats = ({
  workouts,
  workoutsChange,
  totalTime,
  avgTime,
  personalRecords,
  xpEarned,
  level,
  levelProgress,
}: QuickStatsProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-3">This Week</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Workouts */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 text-primary-purple-600 rounded-full p-2">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-600 font-medium">Workouts</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{workouts}</p>
          <p className="text-xs text-green-600 mt-1">↑ {workoutsChange} from last week</p>
        </div>

        {/* Total Time */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-pink-100 text-primary-pink-600 rounded-full p-2">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-600 font-medium">Total Time</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalTime}</p>
          <p className="text-xs text-gray-500 mt-1">{avgTime}</p>
        </div>

        {/* PRs */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 text-blue-600 rounded-full p-2">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-600 font-medium">PRs</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{personalRecords}</p>
          <p className="text-xs text-green-600 mt-1">Personal records!</p>
        </div>

        {/* XP Earned */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 text-orange-600 rounded-full p-2">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-600 font-medium">XP Earned</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{xpEarned}</p>
          <p className="text-xs text-gray-500 mt-1">
            Level {level} • {levelProgress}%
          </p>
        </div>
      </div>
    </div>
  )
}
