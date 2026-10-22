"use strict";

const STORAGE_KEY = "quiz-live-arena-v1";

const DEFAULT_QUIZ = {
  title: "みんなでクイズ大会！",
  questions: [
    {
      question: "日本の首都はどこ？",
      answers: ["大阪", "東京", "京都", "札幌"],
      correct: 1,
      time: 20,
      image: ""
    },
    {
      question: "1年は何か月？",
      answers: ["10か月", "11か月", "12か月", "13か月"],
      correct: 2,
      time: 15,
      image: ""
    },
    {
      question: "北海道の道庁所在地は？",
      answers: ["旭川市", "函館市", "帯広市", "札幌市"],
      correct: 3,
      time: 20,
      image: ""
    }
  ]
};

const COLORS = ["red", "blue", "yellow", "green"];

let quiz = loadQuiz();
let playerName = "";
let currentQuestionIndex = 0;
let score = 0;
let answersLog = [];
let questionStartedAt = 0;
let timerInterval = null;
let timeLeft = 0;

const $ = (selector) => document.querySelector(selector);

function loadQuiz() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(DEFAULT_QUIZ);
  } catch (error) {
    console.error("クイズの読み込みに失敗しました:", error);
    return structuredClone(DEFAULT_QUIZ);
  }
}

function saveQuiz() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quiz));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function showScreen(screenName) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  const target = document.getElementById(`${screenName}-screen`);
  if (target) target.classList.add("active");
}

function showMessage(message) {
  alert(message);
}

function renderHome() {
  const titleElement = $("#home-quiz-title");
  if (titleElement) titleElement.textContent = quiz.title;

  const countElement = $("#question-count");
  if (countElement) countElement.textContent = quiz.questions.length;
}

function renderEditor() {
  const titleInput = $("#quiz-title");
  if (titleInput) titleInput.value = quiz.title;

  const list = $("#question-list");
  if (!list) return;

  list.innerHTML = "";

  quiz.questions.forEach((question, index) => {
    const card = document.createElement("div");
    card.className = "question-card";

    card.innerHTML = `
      <div class="question-card-header">
        <h3>問題 ${index + 1}</h3>
        <button class="delete-question" data-index="${index}" type="button">
          削除
        </button>
      </div>

      <label>
        問題文
        <input
          class="question-text"
          data-index="${index}"
          value="${escapeHTML(question.question)}"
          placeholder="問題を入力してください"
        >
      </label>

      <div class="answer-grid">
        ${question.answers.map((answer, answerIndex) => `
          <label class="answer-field answer-${COLORS[answerIndex]}">
            選択肢 ${answerIndex + 1}
            <input
              class="answer-text"
              data-question="${index}"
              data-answer="${answerIndex}"
              value="${escapeHTML(answer)}"
              placeholder="選択肢を入力"
            >
          </label>
        `).join("")}
      </div>

      <label>
        正解
        <select class="correct-answer" data-index="${index}">
          ${question.answers.map((answer, answerIndex) => `
            <option value="${answerIndex}" ${question.correct === answerIndex ? "selected" : ""}>
              ${answerIndex + 1}. ${escapeHTML(answer || "未入力")}
            </option>
          `).join("")}
        </select>
      </label>

      <div class="editor-bottom-row">
        <label>
          制限時間（秒）
          <input
            class="question-time"
            data-index="${index}"
            type="number"
            min="5"
            max="120"
            value="${question.time || 20}"
          >
        </label>

        <label>
          画像URL（任意）
          <input
            class="question-image"
            data-index="${index}"
            type="url"
            value="${escapeHTML(question.image || "")}"
            placeholder="https://example.com/image.jpg"
          >
        </label>
      </div>
    `;

    list.appendChild(card);
  });
}

function updateQuizFromEditor() {
  const titleInput = $("#quiz-title");
  if (titleInput) {
    quiz.title = titleInput.value.trim() || "クイズ大会";
  }

  document.querySelectorAll(".question-text").forEach((input) => {
    const index = Number(input.dataset.index);
    if (quiz.questions[index]) {
      quiz.questions[index].question = input.value;
    }
  });

  document.querySelectorAll(".answer-text").forEach((input) => {
    const questionIndex = Number(input.dataset.question);
    const answerIndex = Number(input.dataset.answer);

    if (quiz.questions[questionIndex]) {
      quiz.questions[questionIndex].answers[answerIndex] = input.value;
    }
  });

  document.querySelectorAll(".correct-answer").forEach((select) => {
    const index = Number(select.dataset.index);
    if (quiz.questions[index]) {
      quiz.questions[index].correct = Number(select.value);
    }
  });

  document.querySelectorAll(".question-time").forEach((input) => {
    const index = Number(input.dataset.index);
    if (quiz.questions[index]) {
      const value = Number(input.value);
      quiz.questions[index].time = Math.min(120, Math.max(5, value || 20));
    }
  });

  document.querySelectorAll(".question-image").forEach((input) => {
    const index = Number(input.dataset.index);
    if (quiz.questions[index]) {
      quiz.questions[index].image = input.value.trim();
    }
  });
}

function addQuestion() {
  updateQuizFromEditor();

  quiz.questions.push({
    question: "",
    answers: ["", "", "", ""],
    correct: 0,
    time: 20,
    image: ""
  });

  renderEditor();

  const cards = document.querySelectorAll(".question-card");
  if (cards.length) {
    cards[cards.length - 1].scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}

function deleteQuestion(index) {
  if (quiz.questions.length <= 1) {
    showMessage("問題は最低1問必要です。");
    return;
  }

  if (!confirm(`問題 ${index + 1} を削除しますか？`)) return;

  updateQuizFromEditor();
  quiz.questions.splice(index, 1);
  renderEditor();
}

function validateQuiz() {
  if (!quiz.questions.length) {
    showMessage("問題を1問以上作成してください。");
    return false;
  }

  for (let i = 0; i < quiz.questions.length; i++) {
    const question = quiz.questions[i];

    if (!question.question.trim()) {
      showMessage(`問題 ${i + 1} の問題文を入力してください。`);
      return false;
    }

    if (question.answers.some((answer) => !answer.trim())) {
      showMessage(`問題 ${i + 1} の4つの選択肢をすべて入力してください。`);
      return false;
    }

    if (
      !Number.isInteger(question.correct) ||
      question.correct < 0 ||
      question.correct > 3
    ) {
      showMessage(`問題 ${i + 1} の正解を選択してください。`);
      return false;
    }
  }

  return true;
}

function startQuiz() {
  updateQuizFromEditor();

  if (!validateQuiz()) return;

  saveQuiz();

  currentQuestionIndex = 0;
  score = 0;
  answersLog = [];

  showScreen("play");
  renderQuestion();
}

function renderQuestion() {
  clearInterval(timerInterval);

  const question = quiz.questions[currentQuestionIndex];
  if (!question) {
    showResults();
    return;
  }

  const questionNumber = $("#play-question-number");
  const questionTitle = $("#play-question-title");
  const answersContainer = $("#play-answers");
  const progress = $("#quiz-progress");
  const imageElement = $("#question-image");
  const nextButton = $("#next-question");

  if (questionNumber) {
    questionNumber.textContent =
      `問題 ${currentQuestionIndex + 1} / ${quiz.questions.length}`;
  }

  if (questionTitle) {
    questionTitle.textContent = question.question;
  }

  if (progress) {
    progress.style.width =
      `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`;
  }

  if (imageElement) {
    if (question.image) {
      imageElement.src = question.image;
      imageElement.alt = "問題の画像";
      imageElement.hidden = false;
      imageElement.onerror = () => {
        imageElement.hidden = true;
      };
    } else {
      imageElement.hidden = true;
      imageElement.removeAttribute("src");
    }
  }

  if (nextButton) {
    nextButton.hidden = true;
  }

  if (answersContainer) {
    answersContainer.innerHTML = "";

    question.answers.forEach((answer, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `answer-button answer-${COLORS[index]}`;
      button.innerHTML = `
        <span class="answer-shape">${["▲", "◆", "●", "■"][index]}</span>
        <span>${escapeHTML(answer)}</span>
      `;

      button.addEventListener("click", () => chooseAnswer(index));
      answersContainer.appendChild(button);
    });
  }

  timeLeft = question.time || 20;
  questionStartedAt = Date.now();
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      chooseAnswer(null);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timer = $("#quiz-timer");
  if (timer) {
    timer.textContent = Math.max(0, timeLeft);
    timer.classList.toggle("timer-warning", timeLeft <= 5);
  }
}

function chooseAnswer(answerIndex) {
  if (timerInterval === null) return;

  clearInterval(timerInterval);
  timerInterval = null;

  const question = quiz.questions[currentQuestionIndex];
  const elapsedSeconds = (Date.now() - questionStartedAt) / 1000;
  const isCorrect = answerIndex === question.correct;

  let earnedPoints = 0;

  if (isCorrect) {
    const totalTime = question.time || 20;
    const remainingRatio = Math.max(0, 1 - elapsedSeconds / totalTime);
    earnedPoints = Math.round(500 + 500 * remainingRatio);
    score += earnedPoints;
  }

  answersLog.push({
    question: question.question,
    selected: answerIndex,
    correct: question.correct,
    isCorrect,
    points: earnedPoints
  });

  const buttons = document.querySelectorAll(".answer-button");

  buttons.forEach((button, index) => {
    button.disabled = true;

    if (index === question.correct) {
      button.classList.add("answer-correct");
    } else if (index === answerIndex) {
      button.classList.add("answer-incorrect");
    }
  });

  const feedback = $("#answer-feedback");
  if (feedback) {
    feedback.textContent = answerIndex === null
      ? `時間切れ！ 正解は「${question.answers[question.correct]}」`
      : isCorrect
        ? `正解！ +${earnedPoints} 点`
        : `不正解！ 正解は「${question.answers[question.correct]}」`;

    feedback.className = isCorrect
      ? "answer-feedback correct"
      : "answer-feedback incorrect";
  }

  const nextButton = $("#next-question");
  if (nextButton) {
    nextButton.hidden = false;
    nextButton.textContent =
      currentQuestionIndex === quiz.questions.length - 1
        ? "結果を見る"
        : "次の問題へ";
  }
}

function nextQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex >= quiz.questions.length) {
    showResults();
  } else {
    renderQuestion();
  }
}

function showResults() {
  clearInterval(timerInterval);
  timerInterval = null;

  showScreen("results");

  const correctCount = answersLog.filter((entry) => entry.isCorrect).length;
  const total = quiz.questions.length;
  const percentage = total ? Math.round((correctCount / total) * 100) : 0;

  const scoreElement = $("#final-score");
  const correctElement = $("#final-correct");
  const percentageElement = $("#final-percentage");
  const titleElement = $("#results-title");

  if (scoreElement) scoreElement.textContent = score.toLocaleString();
  if (correctElement) correctElement.textContent = `${correctCount} / ${total}`;
  if (percentageElement) percentageElement.textContent = `${percentage}%`;

  if (titleElement) {
    titleElement.textContent =
      percentage === 100 ? "パーフェクト！" :
      percentage >= 70 ? "すばらしい！" :
      percentage >= 40 ? "よく頑張りました！" :
      "次はもっと正解しよう！";
  }

  const review = $("#answer-review");

  if (review) {
    review.innerHTML = answersLog.map((entry, index) => {
      const question = quiz.questions[index];

      return `
        <div class="review-item ${entry.isCorrect ? "review-correct" : "review-incorrect"}">
          <strong>問題 ${index + 1}: ${escapeHTML(entry.question)}</strong>
          <p>あなたの回答：
            ${entry.selected === null
              ? "時間切れ"
              : escapeHTML(question.answers[entry.selected])}
          </p>
          <p>正解：${escapeHTML(question.answers[entry.correct])}</p>
          <p>${entry.isCorrect ? `獲得ポイント：${entry.points}` : "0ポイント"}</p>
        </div>
      `;
    }).join("");
  }
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  answersLog = [];
  showScreen("play");
  renderQuestion();
}

function init() {
      const nameInput = $("#player-name");
  const joinButton = $("#name-join");

  if (nameInput && joinButton) {
    joinButton.addEventListener("click", () => {
      const name = nameInput.value.trim();

      if (!name) {
        alert("名前を入力してください！");
        nameInput.focus();
        return;
      }

      playerName = name;
      renderHome();
  showScreen("name");
      showScreen("home");
    });

    nameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        joinButton.click();
      }
    });
  }
  renderHome();

  const editButton = $("#edit-quiz");
  if (editButton) {
    editButton.addEventListener("click", () => {
      renderEditor();
      showScreen("editor");
    });
  }

  const startButton = $("#start-quiz");
  if (startButton) {
    startButton.addEventListener("click", () => {
      renderEditor();
      showScreen("editor");
    });
  }

  const addButton = $("#add-question");
  if (addButton) addButton.addEventListener("click", addQuestion);

  const saveButton = $("#save-quiz");
  if (saveButton) {
    saveButton.addEventListener("click", () => {
      updateQuizFromEditor();

      if (!validateQuiz()) return;

      saveQuiz();
      renderHome();
      showMessage("クイズを保存しました！");
      showScreen("home");
    });
  }

  const playButton = $("#play-quiz");
  if (playButton) playButton.addEventListener("click", startQuiz);

  const nextButton = $("#next-question");
  if (nextButton) nextButton.addEventListener("click", nextQuestion);

  const restartButton = $("#restart-quiz");
  if (restartButton) {
    restartButton.addEventListener("click", restartQuiz);
  }

  const homeButton = $("#back-home");
  if (homeButton) {
    homeButton.addEventListener("click", () => {
      clearInterval(timerInterval);
      timerInterval = null;
      renderHome();
      showScreen("home");
    });
  }

  const questionList = $("#question-list");
  if (questionList) {
    questionList.addEventListener("click", (event) => {
      const button = event.target.closest(".delete-question");
      if (button) deleteQuestion(Number(button.dataset.index));
    });
  }

  const titleInput = $("#quiz-title");
  if (titleInput) {
    titleInput.addEventListener("input", () => {
      quiz.title = titleInput.value;
    });
  }

  renderHome();
}


document.addEventListener("DOMContentLoaded", init);