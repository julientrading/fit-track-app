import { Bell } from 'lucide-react'

interface DashboardHeaderProps {
  userName: string
  streak: number
}

export const DashboardHeader = ({ userName, streak }: DashboardHeaderProps) => {
  return (
    <div className="bg-gradient-primary text-white px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm opacity-90">Welcome back,</p>
            <h1 className="text-2xl font-bold">{userName}! 👋</h1>
          </div>
          <button className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition">
            <Bell className="w-6 h-6" />
          </button>
        </div>

        {/* Streak Counter */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold mb-1">Current Streak</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">{streak}</span>
                <span className="text-xl font-bold">Days</span>
              </div>
            </div>
            <div className="text-5xl animate-pulse">🔥</div>
          </div>
        </div>
      </div>
    </div>
  )
}
