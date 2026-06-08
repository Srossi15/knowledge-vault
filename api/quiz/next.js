// api/quiz/next.js - GET endpoint to return next quiz question

import { getNextArticleToQuiz } from '../../lib/spaced-rep.js'
import { getQuestionForArticle } from '../../lib/claude.js'
import { supabase } from '../../lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get next article to quiz on
    const articleId = await getNextArticleToQuiz()

    if (!articleId) {
      return res.status(404).json({
        error: 'No articles available',
        message: 'Please upload some articles first'
      })
    }

    // Get article details
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, title, type')
      .eq('id', articleId)
      .single()

    if (articleError) throw articleError

    // Get a question from this article (or generate one)
    const question = await getQuestionForArticle(articleId)

    // Format response
    return res.status(200).json({
      question: {
        id: question.id,
        text: question.question,
        options: question.options,
        difficulty: question.difficulty
      },
      article: {
        id: articleId,
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
