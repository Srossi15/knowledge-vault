// api/progress/dashboard.js - GET endpoint for user progress stats

import { getProgress } from '../../lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const stats = await getProgress()

    return res.status(200).json({
      stats: {
        totalAnswered: stats.totalAnswered,
        totalCorrect: stats.totalCorrect,
        accuracy: parseFloat(stats.accuracy),
        streak: stats.streak
      },
      recentAnswers: stats.recentAnswers.slice(0, 10)
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}
