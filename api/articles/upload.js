// api/articles/upload.js - Handle PDF/image upload and OCR

import { IncomingForm } from 'formidable'
import { readFileSync } from 'fs'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../../lib/supabase.js'

const client = new Anthropic()

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const form = new IncomingForm()

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Failed to parse file' })
    }

    try {
      const file = files.file?.[0]
      if (!file) {
        return res.status(400).json({ error: 'No file provided' })
      }

      const title = fields.title?.[0] || file.originalFilename || 'Untitled'
      const articleType = fields.type?.[0] || 'economist'

      // Read file content
      const fileContent = readFileSync(file.filepath)
      const base64Content = fileContent.toString('base64')
      const mimeType = file.mimetype || 'application/pdf'

      // Use Claude vision to read the content
      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: base64Content
                }
              },
              {
                type: 'text',
                text: 'Extract and transcribe ALL text from this image/document. Preserve formatting and structure. Return only the extracted text.'
              }
            ]
          }
        ]
      })

      const extractedContent = message.content[0].type === 'text' ? message.content[0].text : ''

      if (!extractedContent) {
        return res.status(400).json({ error: 'Could not extract text from file' })
      }

      // Calculate expiration for Economist articles (3 months)
      const expirationDate = articleType === 'economist'
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        : null

      // Insert into database
      const { data: article, error } = await supabase
        .from('articles')
        .insert({
          title,
          content: extractedContent,
          type: articleType,
          expiration_date: expirationDate,
          added_date: new Date().toISOString()
        })
        .select()

      if (error) throw error

      return res.status(200).json({
        success: true,
        article: article[0],
        contentLength: extractedContent.length,
        message: `Successfully uploaded "${title}". Generating quiz questions...`
      })
    } catch (error) {
      console.error('Error uploading article:', error)
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      })
    }
  })
}
