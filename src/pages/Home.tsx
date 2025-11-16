import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Dumbbell, TrendingUp, Users, Target } from 'lucide-react'

export const Home = () => {
  return (
    <div className="min-h-screen p-6">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold mb-4">
            <span className="gradient-text">Fit Track App</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Universal fitness tracking for ANY workout style. Build custom programs or use
            pre-made ones.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Button size="lg" variant="primary">
            <Dumbbell className="mr-2" size={20} />
            Start Workout
          </Button>
          <Button size="lg" variant="outline">
            <Target className="mr-2" size={20} />
            Create Program
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-3">
                <Dumbbell className="text-white" size={24} />
              </div>
              <CardTitle>Universal Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track any workout style - gym, calisthenics, cardio, yoga, and more. Complete
                flexibility.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-pink rounded-xl flex items-center justify-center mb-3">
                <TrendingUp className="text-white" size={24} />
              </div>
              <CardTitle>Smart Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI-powered suggestions for progressive overload. You decide, we recommend.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-purple rounded-xl flex items-center justify-center mb-3">
                <Users className="text-white" size={24} />
              </div>
              <CardTitle>Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Share programs, compete on leaderboards, and stay motivated with friends.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Setup Status */}
        <Card className="mt-12 border-2 border-primary-purple-200">
          <CardHeader>
            <CardTitle>Setup Complete! ✨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <span>✓</span>
                <span>React + TypeScript + Vite configured</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <span>✓</span>
                <span>Tailwind CSS with purple/pink gradient theme</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <span>✓</span>
                <span>Supabase client configured</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <span>✓</span>
                <span>Component library (Button, Card, Input, Modal)</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <span>✓</span>
                <span>React Router setup</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
