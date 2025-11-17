import { Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface PersonalRecord {
  exerciseName: string
  recordType: 'max_weight' | 'max_volume' | 'max_reps'
  value: string
}

interface PRsAchievedProps {
  personalRecords: PersonalRecord[]
}

export function PRsAchieved({ personalRecords }: PRsAchievedProps) {
  if (personalRecords.length === 0) {
    return null
  }

  const getRecordLabel = (type: PersonalRecord['recordType']) => {
    switch (type) {
      case 'max_weight':
        return 'Max Weight'
      case 'max_volume':
        return 'Max Volume'
      case 'max_reps':
        return 'Max Reps'
    }
  }

  return (
    <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
          <Trophy className="w-5 h-5" />
          Personal Records ({personalRecords.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {personalRecords.map((pr, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-yellow-300 dark:border-yellow-700 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-400 dark:bg-yellow-600 rounded-full">
                <Trophy className="w-4 h-4 text-yellow-900 dark:text-yellow-100" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {pr.exerciseName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getRecordLabel(pr.recordType)}
                </p>
              </div>
            </div>
            <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
              {pr.value}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
