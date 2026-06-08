# Knowledge Vault — Setup & Deployment Guide

**Complete guide to get Knowledge Vault running in 30 minutes**

---

## Prerequisites

- Node.js 18+ installed
- GitHub account
- Vercel account (free tier)
- Supabase account (free tier)
- Claude API key (from Anthropic)

---

## Step 1: Set Up Supabase (5 minutes)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name it "knowledge-vault"
4. Create a strong password
5. Wait for project to initialize (2 min)

### 1.2 Run Database Schema
1. Go to your project → SQL Editor
2. Click "New Query"
3. Paste the content from `knowledge-vault-schema.sql`
4. Click "Run"
5. Verify all tables created (articles, quiz_questions, user_progress, spaced_rep_schedule)

### 1.3 Get Your Credentials
1. Go to Settings → API
2. Copy your **Project URL** → Save as `SUPABASE_URL`
3. Copy **anon public key** → Save as `SUPABASE_KEY`

---

## Step 2: Set Up Claude API (2 minutes)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create/view your API key
3. Copy it → Save as `CLAUDE_API_KEY`

---

## Step 3: Create GitHub Repository (3 minutes)

1. Create new GitHub repo: `knowledge-vault`
2. Clone locally:
   ```bash
   git clone https://github.com/yourusername/knowledge-vault.git
   cd knowledge-vault
   ```

3. Create project structure:
   ```
   knowledge-vault/
   ├── api/
   │   ├── quiz/
   │   │   ├── next.js
   │   │   └── submit.js
   │   ├── articles/
   │   │   └── upload.js
   │   ├── progress/
   │   │   └── dashboard.js
   │   └── _middleware.js
   ├── lib/
   │   ├── supabase.js
   │   ├── spaced-rep.js
   │   └── claude.js
   ├── public/
   │   ├── index.html
   │   ├── style.css
   │   └── app.js
   ├── scripts/
   │   └── load-articles.js
   ├── .env.local
   ├── .gitignore
   ├── package.json
   ├── vercel.json
   └── README.md
   ```

4. Copy all the files from the `/tmp` directory into your repo

5. Commit and push:
   ```bash
   git add .
   git commit -m "Initial Knowledge Vault setup"
   git push origin main
   ```

---

## Step 4: Deploy to Vercel (5 minutes)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your `knowledge-vault` GitHub repo
4. Click "Import"
5. Go to Settings → Environment Variables
6. Add these:
   - `SUPABASE_URL` = (from Step 1.3)
   - `SUPABASE_KEY` = (from Step 1.3)
   - `CLAUDE_API_KEY` = (from Step 2)
7. Click "Deploy"
8. Wait for deployment (2-3 min)
9. Once deployed, you'll get a URL like `knowledge-vault-abc123.vercel.app`

---

## Step 5: Load Your Articles (5 minutes)

### Option A: Use the Load Script (Recommended)
1. Locally, create `.env.local`:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   CLAUDE_API_KEY=your_claude_api_key
   ```

2. Run the script:
   ```bash
   node scripts/load-articles.js
   ```

3. Script will:
   - Insert all 13 Economist articles
   - Generate 4 quiz questions for each
   - Initialize spaced rep schedule
   - Takes ~2 minutes

### Option B: Manual Upload
1. Go to your Vercel URL
2. Click "Upload Article" button (coming in UI)
3. Select PDF/image of article
4. System auto-OCRs and generates questions

---

## Step 6: Test End-to-End (5 minutes)

1. Visit your Vercel URL (e.g., `https://knowledge-vault-abc123.vercel.app`)
2. You should see:
   - Header with "Knowledge Vault"
   - Loading spinner
   - First quiz question appears

3. Test flow:
   - Select an answer from 4 options
   - Select confidence level (1-5)
   - Click "Submit Answer"
   - See "Correct!" or "Incorrect" feedback
   - Next question auto-loads after 2 seconds

4. Check stats:
   - Click "Stats" button
   - See your accuracy, streak, total answered

5. Verify spaced rep working:
   - Take 5-10 quizzes
   - Come back in a few hours
   - You should see questions from different articles (mix of recent Economist + books)

---

## Troubleshooting

### "Failed to load question"
- Check Supabase is up (go to supabase.com dashboard)
- Verify environment variables are set correctly in Vercel
- Check that schema was created (go to Supabase SQL editor)

### "Claude API error"
- Verify `CLAUDE_API_KEY` is correct
- Check you have API credits on Anthropic console
- Try refreshing the page

### "No articles loaded"
- Run `node scripts/load-articles.js` locally with correct .env
- Or check Supabase `articles` table has rows

### PDF upload not working
- PDF must be <20MB
- Ensure file type is PDF, PNG, or JPG
- Check Vercel logs for errors

---

## What Happens Next

Once live:

1. **Daily use:** Visit your URL, take 5-10 min quiz
2. **Spaced repetition:** Algorithm pulls 60% recent Economist, 40% books
3. **Auto-decay:** Economist articles fade after 90 days, books stay forever
4. **Progress tracking:** Your accuracy, streaks, confidence tracked
5. **Knowledge deepens:** Repeated exposure builds long-term retention

---

## Customization

### Change Quiz Timing
In `lib/spaced-rep.js`, modify `INTERVALS`:
```javascript
const INTERVALS = [1, 3, 7, 14, 30, 60, 90] // days between reviews
```

### Change Content Mix
In `lib/spaced-rep.js`, modify weights:
```javascript
if (random < 0.6) { // 60% recent, 40% books
```

### Change Economist Expiration
In `lib/spaced-rep.js`:
```javascript
daysSinceAdded > 90 // Change 90 to your preferred days
```

---

## Support & Next Steps

Once deployed and articles loaded, you're ready to start learning!

Next improvements (if desired):
- Add mobile app
- Add email summaries
- Add dark mode
- Add custom article upload UI
- Add progress charts/analytics
- Add social features (friend leaderboards)

For now: **Start taking quizzes and let the spaced repetition work its magic.**

---

## Files Summary

| File | Purpose |
|------|---------|
| `api/quiz/next.js` | Get next question (spaced rep) |
| `api/quiz/submit.js` | Record answer, update progress |
| `api/progress/dashboard.js` | Return user stats |
| `api/articles/upload.js` | Upload PDF/image, OCR with Claude |
| `lib/supabase.js` | Database queries |
| `lib/spaced-rep.js` | Spaced repetition algorithm |
| `lib/claude.js` | Question generation |
| `public/index.html` | Quiz UI |
| `public/app.js` | Frontend logic |
| `scripts/load-articles.js` | Bulk load articles & questions |
| `vercel.json` | Vercel config |
| `package.json` | Dependencies |

---

**Your Knowledge Vault is ready. Start learning! 🚀**
