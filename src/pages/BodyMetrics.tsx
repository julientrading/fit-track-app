import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronLeft,
  Plus,
  Trash2,
  Ruler,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAuthStore } from '@/stores/authStore'
import { getBodyMeasurements, deleteBodyMeasurement } from '@/lib/database'
import type { BodyMeasurement } from '@/types/database'

type TimePeriod = '1w' | '1m' | '3m' | '6m' | '1y' | 'all'
type MeasurementType = BodyMeasurement['measurement_type']

// Measurement type labels
const MEASUREMENT_LABELS: Record<MeasurementType, string> = {
  weight: 'Weight',
  neck: 'Neck',
  shoulders: 'Shoulders',
  chest: 'Chest',
  biceps_left: 'Biceps (Left)',
  biceps_right: 'Biceps (Right)',
  forearms_left: 'Forearms (Left)',
  forearms_right: 'Forearms (Right)',
  waist: 'Waist',
  hips: 'Hips',
  thighs_left: 'Thighs (Left)',
  thighs_right: 'Thighs (Right)',
  calves_left: 'Calves (Left)',
  calves_right: 'Calves (Right)',
  body_fat_percentage: 'Body Fat %',
}

export function BodyMetrics() {
  const navigate = useNavigate()
  const { userProfile } = useAuthStore()

  // Refs for React Strict Mode
  const isInitializing = useRef(false)
  const hasInitialized = useRef(false)

  // State
  const [selectedMetric, setSelectedMetric] = useState<MeasurementType>('weight')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('3m')
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showMetricDropdown, setShowMetricDropdown] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)

  // Load measurements
  useEffect(() => {
    if (!userProfile) {
      setIsLoading(false)
      return
    }

    const loadMeasurements = async () => {
      // Guard against double loading
      if (isInitializing.current || hasInitialized.current) {
        console.log('[BodyMetrics] Already loading or loaded, skipping...')
        setIsLoading(false)
        return
      }

      try {
        isInitializing.current = true
        console.log('[BodyMetrics] Loading measurements for user:', userProfile.id)
        setIsLoading(true)

        const data = await getBodyMeasurements(userProfile.id, undefined, 200)
        setMeasurements(data)

        console.log('[BodyMetrics] Loaded', data.length, 'measurements')

        hasInitialized.current = true
        isInitializing.current = false
      } catch (error) {
        console.error('[BodyMetrics] Failed to load measurements:', error)
        isInitializing.current = false
      } finally {
        setIsLoading(false)
      }
    }

    loadMeasurements()
  }, [userProfile])

  // Filter measurements by selected metric
  const metricMeasurements = measurements.filter((m) => m.measurement_type === selectedMetric)

  // Filter by time period
  const getFilteredMeasurements = () => {
    const now = new Date()
    let cutoffDate: Date

    switch (timePeriod) {
      case '1w':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '1m':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '3m':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '6m':
        cutoffDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        return metricMeasurements
    }

    return metricMeasurements.filter((m) => new Date(m.measured_at) >= cutoffDate)
  }

  const filteredMeasurements = getFilteredMeasurements()

  // Prepare chart data
  const chartData = [...filteredMeasurements]
    .reverse() // Oldest first for chart
    .map((m) => ({
      date: new Date(m.measured_at).toLocaleDateString(),
      value: m.value,
    }))

  // Calculate stats
  const stats = filteredMeasurements.length > 0
    ? {
        current: filteredMeasurements[0].value,
        currentUnit: filteredMeasurements[0].unit,
        change: filteredMeasurements.length > 1
          ? filteredMeasurements[0].value - filteredMeasurements[filteredMeasurements.length - 1].value
          : 0,
        starting: filteredMeasurements[filteredMeasurements.length - 1].value,
        best: selectedMetric === 'waist' || selectedMetric === 'body_fat_percentage'
          ? Math.min(...filteredMeasurements.map((m) => m.value))
          : Math.max(...filteredMeasurements.map((m) => m.value)),
      }
    : null

  // Get available metric types
  const availableMetrics = Array.from(new Set(measurements.map((m) => m.measurement_type)))

  // Handle delete
  const handleDelete = async (measurementId: string) => {
    if (!window.confirm('Are you sure you want to delete this measurement?')) {
      return
    }

    try {
      await deleteBodyMeasurement(measurementId)
      setMeasurements((prev) => prev.filter((m) => m.id !== measurementId))
    } catch (error) {
      console.error('Failed to delete measurement:', error)
      alert('Failed to delete measurement')
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-primary text-white px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/profile')}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Body Metrics</h1>
          </div>

          {/* Metric Selector */}
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">Measurement Type</label>
            <div className="relative">
              <button
                onClick={() => setShowMetricDropdown(!showMetricDropdown)}
                className="w-full bg-white/20 hover:bg-white/30 rounded-xl px-4 py-3 flex items-center justify-between transition"
              >
                <span className="font-semibold">{MEASUREMENT_LABELS[selectedMetric]}</span>
                <ChevronDown className="w-5 h-5" />
              </button>

              {showMetricDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {availableMetrics.length === 0 ? (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No measurements yet
                    </div>
                  ) : (
                    (Object.keys(MEASUREMENT_LABELS) as MeasurementType[])
                      .filter((type) => availableMetrics.includes(type))
                      .map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setSelectedMetric(type)
                            setShowMetricDropdown(false)
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition ${
                            selectedMetric === type
                              ? 'bg-purple-50 text-primary-purple-600 font-semibold'
                              : 'text-gray-900'
                          }`}
                        >
                          {MEASUREMENT_LABELS[type]}
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Time Period Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              { value: '1w' as TimePeriod, label: '1 Week' },
              { value: '1m' as TimePeriod, label: '1 Month' },
              { value: '3m' as TimePeriod, label: '3 Months' },
              { value: '6m' as TimePeriod, label: '6 Months' },
              { value: '1y' as TimePeriod, label: '1 Year' },
              { value: 'all' as TimePeriod, label: 'All Time' },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setTimePeriod(period.value)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition ${
                  timePeriod === period.value
                    ? 'bg-white text-primary-purple-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            {/* Current */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
              <p className="text-sm text-gray-600 font-semibold mb-2">Current</p>
              <p className="text-3xl font-black text-gray-900">
                {stats.current}
                <span className="text-xl ml-1 text-gray-500">{stats.currentUnit}</span>
              </p>
            </div>

            {/* Change */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
              <p className="text-sm text-gray-600 font-semibold mb-2">Change</p>
              <div className="flex items-center gap-2">
                <p className={`text-3xl font-black ${stats.change > 0 ? 'text-green-600' : stats.change < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)}
                  <span className="text-xl ml-1 text-gray-500">{stats.currentUnit}</span>
                </p>
                {stats.change > 0 && <TrendingUp className="w-6 h-6 text-green-600" />}
                {stats.change < 0 && <TrendingDown className="w-6 h-6 text-red-600" />}
              </div>
            </div>

            {/* Starting */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
              <p className="text-sm text-gray-600 font-semibold mb-2">Starting</p>
              <p className="text-3xl font-black text-gray-900">
                {stats.starting}
                <span className="text-xl ml-1 text-gray-500">{stats.currentUnit}</span>
              </p>
            </div>

            {/* Best */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
              <p className="text-sm text-gray-600 font-semibold mb-2">
                {selectedMetric === 'waist' || selectedMetric === 'body_fat_percentage' ? 'Lowest' : 'Highest'}
              </p>
              <p className="text-3xl font-black text-gray-900">
                {stats.best}
                <span className="text-xl ml-1 text-gray-500">{stats.currentUnit}</span>
              </p>
            </div>
          </div>
        )}

        {/* Graph */}
        {chartData.length > 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4">{MEASUREMENT_LABELS[selectedMetric]} Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#9333EA"
                  strokeWidth={3}
                  dot={{ fill: '#9333EA', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
            <Ruler className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Yet</h3>
            <p className="text-gray-600 mb-4">
              Start logging your {MEASUREMENT_LABELS[selectedMetric].toLowerCase()} to see your progress
            </p>
          </div>
        )}

        {/* Measurement History */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {MEASUREMENT_LABELS[selectedMetric]} History
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border-2 border-gray-200 p-4 animate-pulse"
                >
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : filteredMeasurements.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border-2 border-gray-200">
              <p className="text-gray-600">No measurements recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMeasurements.map((measurement) => (
                <div
                  key={measurement.id}
                  className="bg-white rounded-2xl border-2 border-gray-200 p-4 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-2xl font-black text-gray-900">
                        {measurement.value} {measurement.unit}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">{formatDate(measurement.measured_at)}</p>
                    {measurement.notes && (
                      <p className="text-sm text-gray-700 mt-2 italic">"{measurement.notes}"</p>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(measurement.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                    title="Delete measurement"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowLogModal(true)}
        className="fixed bottom-24 right-6 bg-gradient-primary text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Log Modal - Placeholder for now */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Log Measurement</h2>
            <p className="text-gray-600 mb-4">Measurement logging modal will be implemented next</p>
            <button
              onClick={() => setShowLogModal(false)}
              className="w-full bg-gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
