import { Clock, Dumbbell, Hash, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { formatDuration } from '@/lib/utils'

interface WorkoutSummaryCardProps {
  durationSeconds: number
  totalSets: number
  totalReps: number
  totalVolume: number
  unit?: 'lbs' | 'kg'
}

export function WorkoutSummaryCard({
  durationSeconds,
  totalSets,
  totalReps,
  totalVolume,
  unit = 'lbs',
}: WorkoutSummaryCardProps) {
  const stats = [
    {
      icon: Clock,
      label: 'Duration',
      value: formatDuration(durationSeconds),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Hash,
      label: 'Sets',
      value: totalSets.toString(),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Dumbbell,
      label: 'Reps',
      value: totalReps.toString(),
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Volume',
      value: `${totalVolume.toLocaleString()} ${unit}`,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                    {stat.value}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
