// api/quiz/submit.js - POST endpoint to submit answer and record progress

import { recordAnswer } from '../../lib/supabase.js'
import { updateSpacedRepSchedule } from '../../lib/spaced-rep.js'
import { generateExplanation } from '../../lib/claude.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { questionId, userAnswer, confidence, articleId } = req.body

    // Validate input
    if (typeof questionId !== 'string' || typeof userAnswer !== 'number' || typeof confidence !== 'number') {
      return res.status(400).json({ error: 'Invalid input' })
    }

    if (confidence < 1 || confidence > 5) {
      return res.status(400).json({ error: 'Confidence must be between 1-5' })
    }

    // Record the answer
    const { isCorrect, data } = await recordAnswer(questionId, userAnswer, confidence)

    // Update spaced repetition schedule
    await updateSpacedRepSchedule(articleId, isCorrect, confidence)

    // Return immediate feedback
    const result = {
      isCorrect,
      answeredAt: new Date().toISOString(),
      confidence
    }

    return res.status(200).json(result)
  } catch (error) {
    console.error('Error submitting answer:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}
