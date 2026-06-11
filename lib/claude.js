// lib/claude.js - Claude API integration for quiz generation

import Anthropic from '@anthropic-ai/sdk'
import { supabase } from './supabase.js'

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
})

const CACHE = new Map() // Simple in-memory cache for generated questions

/**
 * Generate multiple choice quiz questions from article content
 * Returns 4-5 questions with 4 options each
 */
export async function generateQuizQuestions(articleId, articleTitle, articleContent) {
  // Check cache first
  const cacheKey = `${articleId}-questions`
  if (CACHE.has(cacheKey)) {
    return CACHE.get(cacheKey)
  }

  const prompt = `You are a quiz master creating multiple choice questions to help someone memorize interesting facts from articles and understand current affairs.

Article: "${articleTitle}"
Content: ${articleContent.substring(0, 2000)}... [truncated for length]

Create exactly 4 multiple choice quiz questions based on this content.

IMPORTANT GUIDELINES:
1. Ask about SPECIFIC FACTS from the article that are worth remembering
2. Questions should test recall: "According to this article, what..." or "What did the article say about..."
3. Focus on memorable details that help someone understand current events and trends
4. For each question, create exactly 4 plausible options (A, B, C, D)
5. One option must be correct, three must be wrong but reasonable
6. Difficulty levels: mix of 1 (easy), 2 (medium), 3 (hard)

Format your response as JSON array:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "difficulty": 1
  },
  ...
]

Return ONLY the JSON array, no other text.`

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    const questions = JSON.parse(content)

    // Validate and clean questions
    const validQuestions = questions
      .filter(q => q.question && q.options && q.options.length === 4 && q.correct_answer !== undefined)
      .map(q => ({
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        difficulty: q.difficulty || 2
      }))

    // Save to database
    for (const q of validQuestions) {
      await supabase.from('quiz_questions').insert({
        article_id: articleId,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        difficulty: q.difficulty,
        principle_based: true
      })
    }

    // Cache for this session
    CACHE.set(cacheKey, validQuestions)

    return validQuestions
  } catch (error) {
    console.error('Error generating quiz questions:', error)
    throw error
  }
}

/**
 * Get or generate a single quiz question for the user
 */
export async function getQuestionForArticle(articleId) {
  // Try to get existing questions
  const { data: questions, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('article_id', articleId)

  if (error) throw error

  if (questions && questions.length > 0) {
    // Pick a random question client-side
    return questions[Math.floor(Math.random() * questions.length)]
  }

  // If no questions exist, generate them
  const { data: article, error: articleError } = await supabase
    .from('articles')
    .select('*')
    .eq('id', articleId)
    .single()

  if (articleError) throw articleError

  const generated = await generateQuizQuestions(articleId, article.title, article.content)

  if (generated.length > 0) {
    return {
      id: `temp-${articleId}`, // Will be replaced with actual ID from DB
      question: generated[0].question,
      options: generated[0].options,
      correct_answer: generated[0].correct_answer,
      difficulty: generated[0].difficulty
    }
  }

  throw new Error('Failed to generate quiz questions')
}

/**
 * Generate explanation for correct/incorrect answer
 */
export async function generateExplanation(question, userAnswer, correctAnswer, options) {
  const prompt = `Given this quiz question and answer feedback, provide a brief, helpful explanation.

Question: "${question}"
Options: ${options.map((o, i) => `${i}: ${o}`).join(', ')}
User answered: ${userAnswer} (${options[userAnswer]})
Correct answer: ${correctAnswer} (${options[correctAnswer]})

Provide a 2-3 sentence explanation of why the correct answer is right and what the user should understand.`

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    return response.content[0].type === 'text' ? response.content[0].text : ''
  } catch (error) {
    console.error('Error generating explanation:', error)
    return 'Check your understanding of this concept.'
  }
}
