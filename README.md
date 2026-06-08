# Knowledge Vault

**AI-powered spaced repetition system for learning and retention**

Transform how you learn and retain knowledge. Upload articles, books, or PDFs. Get daily quizzes powered by Claude's understanding. Watch your knowledge compound over time through scientifically-proven spaced repetition.

## ✨ Features

- **Spaced Repetition:** Questions automatically scheduled based on your confidence and correctness
- **Evergreen Learning:** Books and permanent knowledge stay in your quiz rotation forever
- **Temporal Content:** News articles (Economist, etc.) naturally fade after 3 months as they become outdated
- **Multiple Choice Quizzes:** 4 options per question, principle-focused (not trivia)
- **Claude-Generated Questions:** AI reads your content and creates understanding-based questions
- **Progress Tracking:** Accuracy %, streaks, confidence calibration
- **OCR Support:** Upload PDF or image, system auto-reads and extracts content
- **No Login Required:** Local progress tracking

## 🚀 Quick Start

1. **Deploy:** 
   ```bash
   git clone https://github.com/yourusername/knowledge-vault
   ```
   Follow [SETUP-AND-DEPLOY.md](./SETUP-AND-DEPLOY.md)

2. **Load Articles:**
   ```bash
   node scripts/load-articles.js
   ```

3. **Visit:** Your Vercel URL (e.g., `knowledge-vault-abc123.vercel.app`)

4. **Start Learning:** Take daily quizzes, watch knowledge compound

## 🧠 How It Works

### Daily Quiz Flow
1. Visit the app → Get next question (spaced rep algorithm decides)
2. Select answer + confidence level (1-5)
3. Submit → See feedback + explanation
4. Auto-load next question

### Spaced Repetition Algorithm
- **First review:** 1 day later
- **Second review:** 3 days later
- **Third review:** 7 days later
- **Fourth review:** 14 days later
- **Fifth review:** 30 days later
- **Long-term:** 60-90 days

Intervals automatically adjust based on your confidence and correctness.

### Content Types

**Economist Articles & News (Temporal)**
- Quiz heavily for first 3 months
- Naturally fade from rotation after 90 days
- Useful for understanding trends, not long-term retention
- 60% of daily quiz mix

**Books & Permanent Knowledge (Evergreen)**
- Quiz forever with spaced repetition
- All content stays in rotation indefinitely
- Build deep, lasting knowledge
- 40% of daily quiz mix

## 📊 Metrics Tracked

- **Accuracy:** % of questions answered correctly
- **Current Streak:** Consecutive correct answers
- **Total Answered:** Lifetime quiz questions
- **Confidence Calibration:** How well you know what you know
- **Average Confidence per Article:** Identifies weak areas

## 🛠 Architecture

```
Frontend (HTML + Tailwind + Vanilla JS)
  ↓
Backend API (Node.js + Express on Vercel)
  ↓
Supabase PostgreSQL Database
  ↓
Claude API (Question Generation)
```

**Endpoints:**
- `GET /api/quiz/next` — Get next question
- `POST /api/quiz/submit` — Record answer
- `GET /api/progress/dashboard` — Get stats
- `POST /api/articles/upload` — Upload + OCR

## 📁 Project Structure

```
knowledge-vault/
├── api/                    # Serverless API routes
│   ├── quiz/
│   │   ├── next.js        # Get next question
│   │   └── submit.js      # Submit answer
│   ├── articles/
│   │   └── upload.js      # PDF/image upload + OCR
│   └── progress/
│       └── dashboard.js   # User stats
├── lib/
│   ├── supabase.js        # Database client
│   ├── spaced-rep.js      # Spaced rep algorithm
│   └── claude.js          # Claude API integration
├── public/
│   ├── index.html         # Quiz UI
│   └── app.js             # Frontend logic
├── scripts/
│   └── load-articles.js   # Bulk load articles
├── package.json           # Dependencies
├── vercel.json            # Vercel config
└── .env.local             # Local environment variables
```

## 🔧 Environment Variables

Required:
- `SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_KEY` — Supabase anon public key
- `CLAUDE_API_KEY` — Anthropic Claude API key

## 🎯 Key Principles

**Why this system works:**

1. **Spaced Repetition:** Most scientifically-proven learning method
2. **Principle-Focused Questions:** Tests understanding, not memorization
3. **Confidence Calibration:** You learn what you actually know vs. think you know
4. **Content Decay:** Temporal content naturally fades; evergreen content persists
5. **Multiple Exposures:** Same article revisited at increasing intervals
6. **Minimal Friction:** 5-10 min daily habit, auto-load next question

## 📚 What You Learn

The system is optimized for **transferable principles**, not trivia:

✅ **Good questions:**
- "Why does specialization create fragility?" (transfers to any system)
- "What's the core flaw in crude filtering mechanisms?" (applies to policy, hiring, etc.)
- "How does perception disconnect from reality in economics?" (explains voter behavior)

❌ **Bad questions:**
- "What was the exact salary threshold in Britain in 2025?" (temporal trivia)
- "Name three Italian yacht builders" (noise)
- "What date did the USS Nimitz arrive?" (irrelevant detail)

## 🚀 Deploying Your Own

1. **Fork & Clone:** [Full setup guide here](./SETUP-AND-DEPLOY.md)
2. **Set Up Supabase:** PostgreSQL database
3. **Deploy to Vercel:** Serverless functions
4. **Load Articles:** Use script or upload manually
5. **Start Learning:** Visit your URL

Estimated setup time: **30 minutes**

## 📖 Example: How to Use

### Day 1
- Upload 5 Economist articles
- Upload "Prisoners of Geography" (book)
- Take first quiz (gets 5-7 random questions)
- See feedback on each answer

### Week 1
- Take daily quizzes
- Some questions repeat from earlier articles (spaced rep)
- Accuracy builds as you reinforce knowledge
- Confidence selector helps you calibrate

### Month 1
- 30+ days of learning
- Economist articles still heavily weighted (recent)
- Books appearing regularly (evergreen)
- Progress dashboard shows 80%+ accuracy on repeated questions

### Month 3
- Economist articles from month 1 starting to fade
- New Economist articles keeping content fresh
- Books staying in rotation forever
- Spaced rep intervals getting longer (review every 14-30 days)

### Year 1
- Early Economist articles fully faded from rotation
- Intermediate articles fading
- Recent Economist articles still active
- Books you read months ago still appearing, tested at ~60-90 day intervals
- Knowledge from books is now internalized

## 🎓 The Learning Effect

After 90 days of 5-10 min daily quizzes:
- You'll have internalized ~30-50 articles/chapters
- Remember key principles from months ago
- Be able to apply ideas to new situations
- Have a mental framework for understanding finance, geopolitics, strategy

This is **real learning**, not cramming.

## 🔄 Updates & Customization

Want to customize? Edit these files:

- **Change spaced rep intervals:** `lib/spaced-rep.js` → `INTERVALS`
- **Change content mix:** `lib/spaced-rep.js` → `if (random < 0.6)` (currently 60/40)
- **Change Economist expiration:** `lib/spaced-rep.js` → `daysSinceAdded > 90`
- **Change UI colors:** `public/index.html` → CSS variables

## 📝 License

MIT — Use it, learn with it, modify it.

## 🤝 Contributing

See [SETUP-AND-DEPLOY.md](./SETUP-AND-DEPLOY.md) for full deployment guide.

---

**Built with ❤️ for deep, lasting learning**

Start your Knowledge Vault today. Stop forgetting. Start retaining. 🚀
