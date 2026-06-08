// lib/supabase.js - Supabase client initialization

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions for database operations

export async function getArticleById(articleId) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', articleId)
    .single()

  if (error) throw error
  return data
}

export async function getRecentArticles(days = 90) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .gt('added_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('added_date', { ascending: false })

  if (error) throw error
  return data
}

export async function getEverreenArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('type', 'book')
    .order('added_date', { ascending: false })

  if (error) throw error
  return data
}

export async function getQuizQuestions(articleId) {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('article_id', articleId)

  if (error) throw error
  return data
}

export async function recordAnswer(questionId, userAnswer, confidence) {
  const question = await supabase
    .from('quiz_questions')
    .select('correct_answer')
    .eq('id', questionId)
    .single()

  const isCorrect = question.data.correct_answer === userAnswer

  const { data, error } = await supabase
    .from('user_progress')
    .insert({
      question_id: questionId,
      user_answer: userAnswer,
      confidence,
      is_correct: isCorrect
    })

  if (error) throw error
  return { isCorrect, data }
}

export async function getProgress() {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .order('answered_at', { ascending: false })

  if (error) throw error

  // Calculate stats
  const totalAnswered = data.length
  const totalCorrect = data.filter(d => d.is_correct).length
  const accuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered * 100).toFixed(1) : 0
  const streak = calculateStreak(data)

  return {
    totalAnswered,
    totalCorrect,
    accuracy,
    streak,
    recentAnswers: data.slice(0, 20)
  }
}

function calculateStreak(answers) {
  let streak = 0
  for (const answer of answers) {
    if (answer.is_correct) {
      streak++
    } else {
      break
    }
  }
  return streak
}
