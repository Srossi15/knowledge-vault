// lib/spaced-rep.js - Spaced repetition algorithm

import { supabase } from './supabase.js'

/**
 * Spaced Repetition Schedule based on SM-2 algorithm
 * Intervals: 1 day, 3 days, 7 days, 14 days, 30 days, 60 days, etc.
 */

const INTERVALS = [1, 3, 7, 14, 30, 60, 90] // days

export async function getNextArticleToQuiz() {
  // Get articles due for review (next_ask <= now)
  const now = new Date().toISOString()

  const { data: dueArticles, error } = await supabase
    .from('spaced_rep_schedule')
    .select('article_id, articles(*)')
    .lte('next_ask', now)
    .order('next_ask', { ascending: true })

  if (error) throw error

  // If no articles due, pick random from recent (economist) and books (books)
  if (!dueArticles || dueArticles.length === 0) {
    return getRandomArticleForQuiz()
  }

  // Weighted selection: 60% recent (economist), 40% evergreen (books)
  const economistArticles = dueArticles.filter(a => a.articles.type === 'economist')
  const bookArticles = dueArticles.filter(a => a.articles.type === 'book')

  const random = Math.random()
  if (random < 0.6 && economistArticles.length > 0) {
    return economistArticles[0].article_id
  }
  return bookArticles[0]?.article_id || economistArticles[0]?.article_id
}

async function getRandomArticleForQuiz() {
  // 60% recent economist, 40% books
  const random = Math.random()

  if (random < 0.6) {
    // Get recent economist article
    const { data, error } = await supabase
      .from('articles')
      .select('id')
      .eq('type', 'economist')
      .gte('added_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('RANDOM()')
      .limit(1)

    if (error || !data.length) return null
    return data[0].id
  } else {
    // Get random book article
    const { data, error } = await supabase
      .from('articles')
      .select('id')
      .eq('type', 'book')
      .order('RANDOM()')
      .limit(1)

    if (error || !data.length) return null
    return data[0].id
  }
}

/**
 * Update spaced rep schedule after user answers
 * Factors: confidence, correctness, difficulty
 */
export async function updateSpacedRepSchedule(articleId, isCorrect, confidence) {
  // Get current schedule
  const { data: schedule, error: getError } = await supabase
    .from('spaced_rep_schedule')
    .select('*')
    .eq('article_id', articleId)
    .single()

  if (getError && getError.code !== 'PGRST116') throw getError

  const current = schedule || {
    article_id: articleId,
    difficulty_level: 1,
    times_answered: 0,
    average_confidence: 0
  }

  // Calculate new difficulty based on correctness & confidence
  let newDifficulty = current.difficulty_level
  if (isCorrect && confidence >= 4) {
    newDifficulty = Math.min(3, current.difficulty_level + 1)
  } else if (!isCorrect || confidence <= 2) {
    newDifficulty = Math.max(1, current.difficulty_level - 1)
  }

  // Calculate next review interval
  const intervalIndex = Math.min(newDifficulty - 1, INTERVALS.length - 1)
  const daysUntilNext = INTERVALS[intervalIndex]
  const nextAsk = new Date(Date.now() + daysUntilNext * 24 * 60 * 60 * 1000).toISOString()

  // Update running average confidence
  const newTimesAnswered = current.times_answered + 1
  const newAvgConfidence = (
    (current.average_confidence * current.times_answered + confidence) / newTimesAnswered
  ).toFixed(2)

  // Upsert schedule
  const { error: updateError } = await supabase
    .from('spaced_rep_schedule')
    .upsert({
      article_id: articleId,
      difficulty_level: newDifficulty,
      times_answered: newTimesAnswered,
      average_confidence: newAvgConfidence,
      last_asked: new Date().toISOString(),
      next_ask: nextAsk,
      updated_at: new Date().toISOString()
    })

  if (updateError) throw updateError
}

/**
 * Check if an article should be removed from active rotation
 * Economist articles: fade after 90 days
 * Books: never fade
 */
export async function checkArticleExpiration(articleId) {
  const { data: article, error } = await supabase
    .from('articles')
    .select('type, added_date')
    .eq('id', articleId)
    .single()

  if (error) throw error

  if (article.type !== 'economist') return false // Books never expire

  const daysSinceAdded = (Date.now() - new Date(article.added_date).getTime()) / (1000 * 60 * 60 * 24)
  return daysSinceAdded > 90
}
