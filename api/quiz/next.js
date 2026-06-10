// api/quiz/next.js - GET endpoint to return next quiz question

import { getNextArticleToQuiz } from '../../lib/spaced-rep.js'
import { getQuestionForArticle } from '../../lib/claude.js'
import { supabase } from '../../lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get all articles and pick a random one
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, type')

    if (articlesError) throw articlesError
    if (!articles || articles.length === 0) {
      return res.status(404).json({
        error: 'No articles available',
        message: 'Please upload some articles first'
      })
    }

    // Pick random article
    const article = articles[Math.floor(Math.random() * articles.length)]

    // Get a question from this article
    const question = await getQuestionForArticle(article.id)

    if (!question) {
      return res.status(404).json({
        error: 'No questions for this article'
      })
    }

    // Format response
    return res.status(200).json({
      question: {
        id: question.id,
        text: question.question,
        options: question.options,
        difficulty: question.difficulty
      },
      article: {
        id: article.id,
        title: article.title,
        type: article.type
      }
    })
  } catch (error) {
    console.error('Error fetching next question:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}
