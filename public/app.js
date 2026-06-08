// public/app.js - Frontend quiz application

let currentQuestion = null
let selectedAnswer = null
let selectedConfidence = null
let hasAnswered = false

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadNextQuestion()
})

// Load next quiz question
async function loadNextQuestion() {
  try {
    document.getElementById('loadingState').style.display = 'block'
    document.getElementById('quizState').style.display = 'none'
    document.getElementById('feedback').innerHTML = ''

    const response = await fetch('/api/quiz/next')
    if (!response.ok) throw new Error('Failed to load question')

    currentQuestion = await response.json()
    displayQuestion()

    document.getElementById('loadingState').style.display = 'none'
    document.getElementById('quizState').style.display = 'block'

    // Reset selection state
    selectedAnswer = null
    selectedConfidence = null
    hasAnswered = false
    document.getElementById('submitBtn').disabled = true
    clearSelections()
  } catch (error) {
    console.error('Error loading question:', error)
    document.getElementById('loadingState').innerHTML = `
      <p class="text-red-600">Error loading question. Please refresh.</p>
    `
  }
}

// Display question and options
function displayQuestion() {
  document.getElementById('questionText').textContent = currentQuestion.question.text
  document.getElementById('articleTitle').textContent = currentQuestion.article.title
  document.getElementById('articleType').textContent =
    currentQuestion.article.type === 'economist' ? 'Current Affairs' : 'Book Knowledge'

  const optionsContainer = document.getElementById('optionsContainer')
  optionsContainer.innerHTML = ''

  currentQuestion.question.options.forEach((option, index) => {
    const button = document.createElement('button')
    button.className = 'option'
    button.textContent = option
    button.onclick = () => selectOption(index)
    optionsContainer.appendChild(button)
  })
}

// Select an answer option
function selectOption(index) {
  if (hasAnswered) return

  selectedAnswer = index
  const options = document.querySelectorAll('.option')
  options.forEach((opt, i) => {
    opt.classList.toggle('selected', i === index)
  })

  // Enable submit button if confidence is also selected
  updateSubmitButton()
}

// Set confidence level
function setConfidence(level) {
  if (hasAnswered) return

  selectedConfidence = level
  document.querySelectorAll('.confidence-btn').forEach(btn => {
    const confidence = parseInt(btn.dataset.confidence)
    btn.classList.toggle('selected', confidence === level)
  })

  // Enable submit button if answer is also selected
  updateSubmitButton()
}

// Update submit button state
function updateSubmitButton() {
  const submitBtn = document.getElementById('submitBtn')
  submitBtn.disabled = selectedAnswer === null || selectedConfidence === null
}

// Submit answer
async function submitAnswer() {
  if (selectedAnswer === null || selectedConfidence === null || hasAnswered) return

  hasAnswered = true
  document.getElementById('submitBtn').disabled = true

  try {
    const response = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: currentQuestion.question.id,
        userAnswer: selectedAnswer,
        confidence: selectedConfidence,
        articleId: currentQuestion.article.id
      })
    })

    if (!response.ok) throw new Error('Failed to submit answer')

    const result = await response.json()

    // Show feedback
    showFeedback(result.isCorrect)

    // Load next question after 2 seconds
    setTimeout(loadNextQuestion, 2000)
  } catch (error) {
    console.error('Error submitting answer:', error)
    showFeedback(false, 'Error submitting answer. Please try again.')
  }
}

// Show feedback
function showFeedback(isCorrect, customMessage = null) {
  const feedbackDiv = document.getElementById('feedback')
  const feedbackClass = isCorrect ? 'feedback correct' : 'feedback incorrect'
  const message = customMessage || (isCorrect ? '✓ Correct!' : '✗ Incorrect')

  feedbackDiv.className = feedbackClass
  feedbackDiv.textContent = message

  // Highlight correct/incorrect options
  const options = document.querySelectorAll('.option')
  options.forEach((opt, i) => {
    opt.classList.remove('correct', 'incorrect')
    if (i === currentQuestion.question.correct_answer) {
      opt.classList.add('correct')
    } else if (i === selectedAnswer && !isCorrect) {
      opt.classList.add('incorrect')
    }
  })
}

// Toggle stats modal
async function toggleStats() {
  const statsModal = document.getElementById('statsModal')
  const isVisible = statsModal.style.display !== 'none'

  if (!isVisible) {
    try {
      const response = await fetch('/api/progress/dashboard')
      if (!response.ok) throw new Error('Failed to load stats')

      const data = await response.json()
      document.getElementById('accuracyStat').textContent = `${data.stats.accuracy}%`
      document.getElementById('streakStat').textContent = data.stats.streak
      document.getElementById('answeredStat').textContent = data.stats.totalAnswered
      document.getElementById('correctStat').textContent = data.stats.totalCorrect
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  statsModal.style.display = isVisible ? 'none' : 'block'
}

// Clear selections
function clearSelections() {
  document.querySelectorAll('.option').forEach(opt => {
    opt.classList.remove('selected', 'correct', 'incorrect')
  })
  document.querySelectorAll('.confidence-btn').forEach(btn => {
    btn.classList.remove('selected')
  })
}
