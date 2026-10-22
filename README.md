
<!Doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>QUIZ係</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
<header class="topbar">
  <a class="brand" href="#"><span class="logo">Q!</span><span>QUIZ <b>係</b> 楽しもう!!</span></a>
  <span class="live-label"><i></i> BROWSER EDITION</span>
</header>

<main>
  <section id="home" class="screen active">
    <div class="hero">
      <div>
        <div class="eyebrow">PLAY TOGETHER. THINK FASTER.</div>
        <h1>クイズで、<br><span>会場がひとつになる。</span></h1>
        <p class="lead">クイズを作成して、問題に挑戦。スコアとランキングを楽しもう！</p>
        <div class="actions">
          <button id="newQuiz" class="btn primary">＋ クイズを作る</button>
          <button id="playSaved" class="btn secondary">クイズで遊ぶ →</button>
        </div>
        <p class="note">保存データはこのブラウザ内に保存されます。</p>
      </div>
      <div class="hero-art"><div class="orbit"></div><div class="cube">?<small>QUIZ!</small></div><div class="float f1">✦ 正解！</div><div class="float f2">⚡ +950 POINTS</div></div>
    </div>
    <section class="library">
      <div class="section-head"><div><div class="eyebrow">YOUR LIBRARY</div><h2>保存したクイズ</h2></div><button id="reload" class="btn secondary small">↻ 更新</button></div>
      <div id="quizList" class="quiz-grid"></div>
    </section>
  </section>

  <section id="editor" class="screen">
    <div class="page-head"><button class="text-button" data-home>← ホーム</button><div class="eyebrow">QUIZ BUILDER</div><h1>クイズを作成</h1><p>問題文、選択肢、正解を設定してください。</p></div>
    <div class="editor">
      <label class="label">クイズタイトル</label>
      <input id="quizTitle" class="input" maxlength="100" placeholder="例：北海道トリビア王決定戦">
      <div class="editor-head"><h2>問題リスト <span id="questionCount">1問</span></h2><button id="addQuestion" class="btn secondary small">＋ 問題を追加</button></div>
      <div id="questions"></div>
      <div class="actions"><button id="saveQuiz" class="btn primary">クイズを保存</button><button class="btn secondary" data-home>キャンセル</button></div>
    </div>
  </section>

  <section id="play" class="screen">
    <div class="page-head"><button class="text-button" data-home>← ホーム</button><div class="eyebrow">QUIZ TIME</div><h1 id="playTitle">クイズ</h1><p id="playSub">正解を選んでください。</p></div>
    <div class="play-card">
      <div class="play-meta"><span id="questionCounter">QUESTION 1</span><span id="timer">20秒</span></div>
      <img id="questionImage" class="question-image hidden" alt="問題画像">
      <h2 id="questionText"></h2>
      <div id="answers" class="answers"></div>
      <div id="feedback" class="feedback hidden"></div>
      <div class="play-footer"><span id="scoreLabel">スコア 0</span><button id="next" class="btn primary" disabled>次へ →</button></div>
    </div>
  </section>

  <section id="results" class="screen">
    <div class="results-card">
      <div class="trophy">🏆</div><div class="eyebrow">GAME OVER</div><h1>結果発表！</h1><p id="finalScore"></p>
      <div id="finalRanks"></div>
      <div class="actions center"><button id="playAgain" class="btn primary">もう一度遊ぶ</button><button class="btn secondary" data-home>ホームへ</button></div>
    </div>
  </section>
</main>

<div id="toast" class="toast" role="status"></div>
<footer><span>QUIZ LIVE ARENA</span><span>PLAY · LEARN · CONNECT</span></footer>
<script src="app.js"></script>
</body>
</html>
