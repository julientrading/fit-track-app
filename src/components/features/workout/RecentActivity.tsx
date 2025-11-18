interface Achievement {
  type: 'pr' | 'badge'
  name: string
}

interface Activity {
  id: string
  name: string
  daysAgo: number
  duration: number
  xp: number
  achievements: Achievement[]
}

interface RecentActivityProps {
  activities: Activity[]
  onViewAll?: () => void
  onActivityClick?: (activityId: string) => void
}

export const RecentActivity = ({ activities, onViewAll, onActivityClick }: RecentActivityProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
        <button
          onClick={onViewAll}
          className="text-sm text-primary-purple-600 font-semibold hover:text-primary-purple-700"
        >
          View All →
        </button>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => onActivityClick?.(activity.id)}
            className="w-full bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-gray-900">{activity.name}</h3>
                <p className="text-sm text-gray-600">
                  {activity.daysAgo} days ago • {activity.duration} min
                </p>
              </div>
              <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
                +{activity.xp} XP
              </div>
            </div>
            {activity.achievements && activity.achievements.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {activity.achievements.map((achievement, index) => (
                  <span
                    key={index}
                    className={
                      achievement.type === 'pr'
                        ? 'bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-semibold'
                        : 'bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs font-semibold'
                    }
                  >
                    {achievement.type === 'pr' ? 'PR: ' : ''}
                    {achievement.name}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
