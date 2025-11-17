import { Zap, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

interface XPEarnedCardProps {
  xpEarned: number
  currentXP: number
  currentLevel: number
  xpToNextLevel: number
}

export function XPEarnedCard({
  xpEarned,
  currentXP,
  currentLevel,
  xpToNextLevel,
}: XPEarnedCardProps) {
  const progressPercentage = Math.min(
    ((currentXP % xpToNextLevel) / xpToNextLevel) * 100,
    100
  )

  return (
    <Card className="bg-gradient-to-br from-purple-500 to-pink-500">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* XP Earned Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/90">XP Earned</p>
                <p className="text-2xl font-bold text-white">+{xpEarned}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white/90">Level</p>
              <p className="text-2xl font-bold text-white">{currentLevel}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/90 font-medium">
                {currentXP % xpToNextLevel} / {xpToNextLevel} XP
              </span>
              <div className="flex items-center gap-1.5 text-white/90">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
              </div>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-white/80 text-center">
              {xpToNextLevel - (currentXP % xpToNextLevel)} XP to Level {currentLevel + 1}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
