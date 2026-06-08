#!/usr/bin/env node

// scripts/load-articles.js - Load sample articles and generate quiz questions
// Run with: node scripts/load-articles.js

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const claudeApiKey = process.env.CLAUDE_API_KEY

if (!supabaseUrl || !supabaseKey || !claudeApiKey) {
  console.error('Missing environment variables: SUPABASE_URL, SUPABASE_KEY, CLAUDE_API_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const claude = new Anthropic({ apiKey: claudeApiKey })

// Your 13 Economist articles (condensed for demo)
const articles = [
  {
    title: "Don't Look Back in Changhua - Northeast Asia's Economic Reform",
    content: `Taiwan, South Korea, and Japan are experiencing a boom in chip exports but face critical fragility from over-specialization. Taiwan's output is growing at 14% annually, South Korea's memory chip profits up 500%, but outside tech sectors, the region is deindustrializing.

The problem: Northeast Asia's export-basket concentration is 73% higher than rich-world average, and it's rising. China now competes across the entire supply chain, not just assembly. Taiwan's goods surplus with mainland flipped to deficit this year.

These economies need radical reform: (1) Stop subsidizing giant firms like TSMC and Samsung—they don't need lavish subsidies. (2) Reform outdated labor and pension systems that suppress domestic demand. (3) Join trade agreements like CPTPP instead of doubling down on industrial policy.

The key principle: Specialization creates fragility. Even as these economies boom, they need to diversify domestically and internationally.`,
    type: 'economist'
  },
  {
    title: "Don't Attack Cuba - Diplomacy Over Military Force",
    content: `Trump and Rubio are frustrated with Cuba's lack of reform and considering military options. But regime change through force would be extremely risky—far riskier than Venezuela.

Why military action fails here: Cuba's dictatorship is more entrenched and ideologically committed. No organized opposition. Cuban security has spent decades preparing bunkers and escape plans. Even if the US seized Raul Castro, the Communist Party, armed forces, and security apparatus are unified—no obvious successor.

The viable option: Negotiated transition. The regime is already negotiating—it released political prisoners and announced economic reforms. More leverage through negotiation (oil access, humanitarian aid, free satellite internet) than through military strikes.

Key principle: Military victory ≠ political victory. Occupation of entrenched opposition is costly and uncertain.`,
    type: 'economist'
  },
  {
    title: "Franchising - Apply Inside",
    content: `Franchising has created more millionaires than almost any other business model in America. 850,000 franchise outlets exist; 1 in 8 American businesses with employees is a franchise.

Why franchising works: It productively aligns incentives when you need geographically dispersed staff, when monitoring is expensive, and when local knowledge matters. Franchisor focuses on brand/product; franchisee adapts to local conditions.

The regulatory story: Franchising exploded after 1979 disclosure rules requiring franchisors to reveal how they make money, startup costs, fees, legal issues, often franchisee financials. Transparency created trust. Since 1986, franchise outlets tripled.

Recent regulation is counterproductive: Making franchisors joint employers (liable for franchisee worker violations) would centralize the system and kill its advantages. Best regulation is transparent disclosure, not top-down control.

Key principle: Decentralized incentive alignment beats centralized control.`,
    type: 'economist'
  },
  {
    title: "Britain's Immigration Policy - Quantity Not Quality",
    content: `Britain reversed from liberal immigration (2021-24: 1.5m arrivals/year) to highly restrictive (2025: 171,000 net, lowest since 2012).

The policy: Restrict to highly skilled/highly paid workers. Raise salary thresholds, increase sponsorship fees, tighten language requirements, shorten student post-grad stay.

The problem: The filtering mechanism doesn't work. IT visas fell from 28,000 (2022) to 10,000 (2025). Care workers plunged as expected, but skilled sectors also down. The government's filter catches good candidates along with bad ones.

The data: Average India-born employee in Britain earns £32,400. Nigeria-born: £34,000. British-born: £30,900. Migrants earn MORE than natives and are slightly more likely to work. The "cheap labour" narrative doesn't match reality.

Key principle: Crude filtering without context catches good candidates too. Economic policy that tries to optimize for one variable (salary) at the expense of actual economic value fails.`,
    type: 'economist'
  },
  {
    title: "Immigration Sentiment in Britain",
    content: `Immigration has crashed 44% in 2 years. But 41% of Britons say it's the top issue (7 points above "economy"). Why? Perception ≠ reality.

Half of Britons think immigration has risen. Only 1 in 6 aware it fell. Public inflates asylum-seeker numbers (think 33%, actual 12%).

Stereotyping dominates: 62% think "small boat arrivals" when they think immigrants, 59% say "asylum-seekers". Only 29% think "people who come to study", 38% "people who work".

But deeper: Most Britons remain open to immigration if it's "under control". When asked about specific occupations, plurality welcome more doctors, nurses, engineers, fruit-pickers.

Key principle: Perception is disconnected from reality in economics. You can execute policy correctly and still lose the narrative war if you don't win the story. Also: People judge policy by vibes, not outcomes.`,
    type: 'economist'
  },
  {
    title: "Bagehot - Treat Britain: The Funfair State",
    content: `British politics has evolved from "welfare state" to "funfair state"—government now subsidizing everyday luxuries, not just survival.

Started with Conservatives: "Eat Out to Help Out" (50% meal discounts). Now every party competes to give "treats"—VAT cuts on theme parks, children's meals.

The insight: "Cost of living crisis" is actually "cost of treats crisis". Inflation is 2.8%, energy bills down 50% from peak, real wages growing. But people lament small luxuries—chips, cinema trips—getting expensive.

The Treat economy keeps retail alive: Corner shops survive on "Snack Mission" traffic (pop in for something small). Nail bars, barbers, hospitality—all depend on Treats keeping public realm together.

But economically damaging: Hospitality is 8% of jobs (up from 6% in 1997). Should shrink so more productive sectors can grow. But Treats are politically powerful—no government will let it happen.

Key principle: Politics moves from structural reform to immediate gratification when facing economic pressure. Treats are economically visible but structurally corrosive.`,
    type: 'economist'
  },
  {
    title: "The Pope and AI - Magnifica Humanitas",
    content: `Pope Leo's first encyclical (42,000 words) warns against Silicon Valley's transhumanism and posthumanism, comparing them to 20th-century eugenics.

The argument: Transhumanism (enhancing humans through tech) and posthumanism (hybridizing humans/machines, leading to "Singularity") both assume human perfectibility. Both justify "necessary sacrifices" in the name of optimization. This is eugenics repackaged.

The Pope's counter: Imperfections are integral to humanity. We flourish through limitations and failure, not despite them. "We carry within us lessons that leave their mark like scars...It is only thanks to the interplay of these elements that the wonders of the soul occur within us."

The irony: Analysis found 11% of the encyclical was AI-generated (likely Claude). Previous encyclicals scored 0%. A warning against AI written partly by AI.

Key principle: Technology that claims to perfect humanity often carries the same risks as eugenics—devaluing those deemed "imperfect". Imperfection is a feature of human flourishing, not a bug.`,
    type: 'economist'
  },
  {
    title: "Superyachts - Ruling the Waves",
    content: `Europe dominates superyacht (24m+ vessels) construction—over 50% of >1,000 built last year made in Europe. Italy's yacht industry: 168,000 jobs, €13bn GDP, 0.6% of economy.

But war in Iran crashed orders 33% in Q1 2026 vs. Q1 2025. Two concerns: (1) Middle Eastern clients may not take delivery. (2) Cheap military drones proved lethal—superyachts are no longer the secure "floating fortresses" ultra-wealthy expected.

But America growing: US is biggest market and growing despite Gulf crisis. New tax law: vessels majority-owned by American firms now tax-deductible. Could offset Middle East losses.

Key principle: Geopolitical risk matters. When a war undermines a key product attribute (security/invulnerability), demand crashes even if the war doesn't directly affect the buyer. Perceived safety is real product value.`,
    type: 'economist'
  },
  {
    title: "Charlemagne - Grey Expectations: Europe's Intergenerational Problem",
    content: `Europe's real crisis: Intergenerational inequality. Baby boomers extracted massive value; young people are locked out.

Housing: Boomers bought for a song, now worth millions. Even inflation-adjusted, European housing up 25% in a decade. Rents rising faster than incomes. Share of 30-year-olds still living with parents: 25% (born 1980s) vs. 17% (born 1960s).

Pensions: Boomers retired early, live long, expect state to pay. Europe uses pay-as-you-go (today's workers fund today's retirees). In 1960, 5 workers per pensioner. Now 2.5. Yet pensions protected, education cut.

Politics: Median voter age in French elections: 52 (near retirement). Old people vote more. Result: Politicians protect pensions, cut education and innovation.

The capital flight: America's private pensions created pools for VC/PE, funding tech growth. Europe's pay-as-you-go system leaves no capital. Fewer big European tech firms result.

Key principle: Intergenerational fairness is economically productive. Systems that extract value from future generations create stagnation and political toxicity.`,
    type: 'economist'
  },
  {
    title: "Trump Immigration Policy - Leave to Return",
    content: `Trump admin wants green card applicants to leave US and apply abroad (consular processing), ending "adjustment of status" pathway used since 1952.

Current system: 58% of 2024's 1.4m green cards came via adjustment (applying while in US). Immediate relatives of citizens, people with dual-intent visas use this.

Problem 1: Practically impossible for many. 75 countries paused visa processing (Cuba, Afghanistan = 40%+ of adjusters). Elsewhere, wait times: 1+ year. Unlawfully present >1 year = automatic 10-year re-entry ban.

Problem 2: Legally shaky. Adjustment wasn't rare exception—it's the standard pathway. Courts will likely overturn this.

Reality: Even if courts block the hard version, USCIS already sending "requests for evidence" demanding more documentation. Process will get expensive, unpredictable, exhausting.

The goal: Make process so painful people self-select out. Admin promised 20m deportations (but only ~14m exist). Preventing legal status may be easier than mass deportation.

Key principle: Governance via bureaucratic friction. Policy doesn't change law, just makes compliance expensive and exhausting.`,
    type: 'economist'
  },
  {
    title: "Lexington - Race to the Stars: Elon Musk's Troubling Politics",
    content: `Elon Musk advances humanity technologically (Tesla, SpaceX) while perpetuating "primitive ideas" politically.

His problem: He thinks about politics in racial categories. Described white people as "rapidly dying minority" and posted amplifying "white solidarity" messaging. Frames society as racial groups under attack. Told Germany to move beyond "past guilt" (Auschwitz context).

Family history rhymes: His grandfather joined Technocracy Incorporated (replace democracy with rule of engineers), later moved to apartheid South Africa. Musk talks about "Martian technocracy" and draws parallels between apartheid-era SA and modern America.

His approach: Aggrieved identity politics he claims to oppose on the left. Conspiracy-minded framing ("they" are destroying white/Western culture). Dark, apocalyptic tone.

The insight: Being good at one thing doesn't make you wise about others. Musk's technical achievement and moral clarity on politics are disconnected. High concentration of power makes authoritarian thinking easier.

Key principle: Genius in one domain doesn't confer wisdom elsewhere. Concentrated power + racial/civilizational thinking = dangerous mix.`,
    type: 'economist'
  },
  {
    title: "Cuba (1) - Will Donald Trump Attack Havana?",
    content: `Trump and Rubio consider military options. Three scenarios: (1) Decapitation raid, (2) Limited strikes, (3) Full invasion. Probably not imminent—USS Nimitz decommissioning, Trump bogged down in Iran. But military planners working.

Why military fails: Invasion militarily easy (Cuban forces weak), but occupation impossible. Decapitation risky—Castro has bunkers, Cuban security 60+ years prepared. Even if seized, power structure unified, no obvious successor.

Limited strikes might not break regime; could backfire. Better option: Negotiation. Regime already negotiating—released prisoners, announced reforms. More leverage via oil access, humanitarian aid, free satellite internet than military force.

Key principle: Military victory ≠ political victory. Occupation of ideologically entrenched opposition is costly/uncertain. Desperation of population doesn't mean they'll accept foreign invader.`,
    type: 'economist'
  },
  {
    title: "Cuba (2) - Havananomics: Economic Recovery Path",
    content: `Cuba's economy collapsing: Sherritt International (only major Western resource project, Canadian nickel refinery) just closed due to fuel blockade. Hotels empty, food/medicine scarce, blackouts.

Recovery depends entirely on Trump. Poll of 800 Cuban-Americans: 2% would invest under current regime; 51% would if regime fell. But Cuba has structural disadvantages vs. Venezuela.

Venezuela had oil (quick economic relief) and organized opposition. Cuba has neither. Would need massive capital infusion, tourism revival, remittances, diaspora capital, American aid.

But possible: Tourism could expand rapidly if Americans allowed to visit. Farmland could shift to productive uses. Economic opening would probably precede political opening.

Key principle: Economics of regime change—how hard it is to rebuild post-collapse. Also: Role of diaspora capital and faith in system/leadership.`,
    type: 'economist'
  }
]

async function generateQuizQuestions(articleId, title, content) {
  const prompt = `You are a quiz master creating multiple choice questions to help someone learn and retain knowledge.

Article: "${title}"
Content: ${content.substring(0, 1500)}...

Create exactly 4 multiple choice quiz questions based on this content.

IMPORTANT GUIDELINES:
1. Focus on PRINCIPLES, not trivia. What's the core idea that transfers to other situations?
2. Questions should test understanding, not memorization of facts
3. For each question, create exactly 4 plausible options (A, B, C, D)
4. One option must be correct, three must be wrong but reasonable
5. Difficulty levels: mix of 1 (easy), 2 (medium), 3 (hard)

Format your response as JSON array:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "difficulty": 1
  }
]

Return ONLY the JSON array, no other text.`

  try {
    const response = await claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const questions = JSON.parse(text)

    // Insert questions into database
    for (const q of questions) {
      await supabase.from('quiz_questions').insert({
        article_id: articleId,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        difficulty: q.difficulty || 2,
        principle_based: true
      })
    }

    return questions.length
  } catch (error) {
    console.error(`Error generating questions for "${title}":`, error)
    return 0
  }
}

async function loadArticles() {
  console.log('Starting article load...\n')

  for (const article of articles) {
    try {
      console.log(`Loading: "${article.title}"...`)

      // Calculate expiration for Economist articles (3 months)
      const expirationDate = article.type === 'economist'
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        : null

      // Insert article
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          content: article.content,
          type: article.type,
          expiration_date: expirationDate,
          added_date: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error(`  ❌ Failed to insert article: ${error.message}`)
        continue
      }

      const articleId = data[0].id

      // Generate quiz questions
      const questionsCount = await generateQuizQuestions(articleId, article.title, article.content)
      console.log(`  ✓ Loaded with ${questionsCount} quiz questions\n`)

      // Initialize spaced rep schedule
      await supabase.from('spaced_rep_schedule').insert({
        article_id: articleId,
        difficulty_level: 1,
        times_answered: 0,
        average_confidence: 0,
        next_ask: new Date().toISOString()
      })
    } catch (error) {
      console.error(`Error loading "${article.title}":`, error)
    }
  }

  console.log('✓ All articles loaded successfully!')
}

loadArticles().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
