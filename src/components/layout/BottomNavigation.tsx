import { Home, TrendingUp, BookOpen, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = 'home' | 'progress' | 'library' | 'community'

interface BottomNavigationProps {
  active?: NavItem
}

export const BottomNavigation = ({ active = 'home' }: BottomNavigationProps) => {
  const navItems = [
    { id: 'home' as NavItem, label: 'Home', icon: Home, href: '/' },
    { id: 'progress' as NavItem, label: 'Progress', icon: TrendingUp, href: '/progress' },
    { id: 'library' as NavItem, label: 'Library', icon: BookOpen, href: '/library' },
    { id: 'community' as NavItem, label: 'Community', icon: Users, href: '/community' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id

            return (
              <a
                key={item.id}
                href={item.href}
                className={cn(
                  'flex-1 py-4 flex flex-col items-center gap-1 transition',
                  isActive
                    ? 'text-primary-purple-600 border-t-2 border-primary-purple-600'
                    : 'text-gray-400 hover:text-primary-purple-600'
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-semibold">{item.label}</span>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
