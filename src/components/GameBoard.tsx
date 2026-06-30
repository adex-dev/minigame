import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css";
import ScoreBoard from "./ScoreBoard";
import wordsDataB1 from "../data/words_b1.json";
import wordsDataB2 from "../data/words_b2.json";
import wordsDataC1 from "../data/words_c1.json";
import daily_b1 from "../data/b1_daily.json";

interface Word {
  id: number;
  word: string;
  meaning: string;
  hint: string;
  level: string;
}

interface Question {
  id: number;
  word: string;
  question: string;
  answer: string;
  hint: string;
  type: "english-to-indo" | "indo-to-english";
  level: string;
}

interface GameBoardProps {
  selectedLevel: string;
  questionCount: number;
  onBackToSetup: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  selectedLevel,
  questionCount,
  onBackToSetup,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [countSkip, setCountSkip] = useState<number>(0);
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isWin, setIsWin] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (inputRef.current && !isGameOver && !isAnswered && !isLoading) {
      inputRef.current.focus();
    }
  }, [currentQuestionIndex, isGameOver, isAnswered, isLoading]);

  const pesan = async (messages: string, action: any, icon: any) => {
    await Swal.fire({
      title: `${action}`,
      text: `${messages}`,
      icon: icon,
    });
    return;
  };

  const initializeGame = async () => {
    setIsLoading(true);
    try {
      let wordsData = [...wordsDataB1, ...wordsDataB2, ...wordsDataC1,...daily_b1].map(
        (item, index) => ({
          ...item,
          id: index + 1,
        }),
      );
      if (selectedLevel === "mudah") {
        wordsData = [...wordsDataB1];
      }
      if (selectedLevel === "sedang") {
        wordsData = [...wordsDataB2];
      }
      if (selectedLevel === "sulit") {
        wordsData = [...wordsDataC1];
      }
      if (selectedLevel === "dailymudah") {
        wordsData = [...daily_b1];
      }
      if (!wordsData || !Array.isArray(wordsData) || wordsData.length === 0) {
        await pesan("Data kata tidak tersedia!", "informasi", "info");
        onBackToSetup();
        return;
      }
      let filteredWords = wordsData;
      if (selectedLevel !== "semua") {
        filteredWords = wordsData.filter(
          (w: Word) => w.level === selectedLevel,
        );
      }
      if (filteredWords.length === 0) {
        await pesan(
          `Tidak ada kata dengan level "${selectedLevel}"!`,
          "informasi",
          "info",
        );
        onBackToSetup();
        return;
      }
      const newQuestions: Question[] = [];

      filteredWords.forEach((word: Word) => {
        // English to Indonesian question
        newQuestions.push({
          id: word.id * 2,
          word: word.word,
          question: `Apa arti dari "${word.word}" dalam Bahasa Indonesia?`,
          answer: word.meaning,
          hint: word.hint,
          type: "english-to-indo",
          level: word.level,
        });

        // Indonesian to English question
        newQuestions.push({
          id: word.id * 2 + 1,
          word: word.word,
          question: `What is the English word for "${word.meaning}"?`,
          answer: word.word,
          hint: word.hint,
          type: "indo-to-english",
          level: word.level,
        });
        const shuffled = newQuestions.sort(() => Math.random() - 0.5);
        const selectedQuestions = shuffled.slice(0, questionCount);
        if (selectedQuestions.length === 0) {
          pesan(
            "Tidak ada pertanyaan yang tersedia untuk level ini!",
            "informasi",
            "info",
          );
          onBackToSetup();
          return;
        }
        setQuestions(selectedQuestions);
        setCurrentQuestionIndex(0);
        setUserAnswer("");
        setScore(0);
        setCountSkip(0);
        setAttempts(0);
        setWrongAttempts(0);
        setIsGameOver(false);
        setIsWin(false);
        setShowHint(false);
        setShowAnswer(false);
        setIsCorrect(null);
        setAnsweredQuestions(new Set());
        setIsAnswered(false);
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Error initializing game:", error);
      await pesan(
        "Terjadi kesalahan saat memuat game. Silakan kembali ke menu.",
        "kesalahan",
        "error",
      );
      onBackToSetup();
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion?.answer || "";
  const isQuestionAnswered = currentQuestion
    ? answeredQuestions.has(currentQuestion.id)
    : false;

  const handleCheckAnswer = async () => {
    if (isGameOver || isQuestionAnswered || isWin || isLoading) return;

    const trimmedAnswer = userAnswer.trim();
    if (trimmedAnswer.length === 0) {
      await pesan(
        "Silakan masukkan jawaban terlebih dahulu!",
        "informasi",
        "info",
      );
      return;
    }

    setAttempts(attempts + 1);
    setIsAnswered(true);

    // Check if answer is correct (case insensitive, trim spaces)
    const isAnswerCorrect =
      trimmedAnswer.toUpperCase().trim() === currentAnswer.toUpperCase().trim();

    if (isAnswerCorrect) {
      setIsCorrect(true);
      setIsWin(true);
      setScore(score + 10);
      setAnsweredQuestions(new Set([...answeredQuestions, currentQuestion.id]));
      setShowAnswer(true);

      setTimeout(() => {
        nextQuestion();
      }, 2000);
    } else {
      setIsCorrect(false);
      setWrongAttempts(wrongAttempts + 1);
      setScore(score - 3);
      setTimeout(() => {
        setIsCorrect(null);
        setIsAnswered(false);
        setUserAnswer("");
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCheckAnswer();
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer("");
      setIsWin(false);
      setIsCorrect(null);
      setShowHint(false);
      setShowAnswer(false);
      setIsAnswered(false);
    } else {
      setIsGameOver(true);
    }
  };

  const skipQuestion = () => {
    if (isGameOver || isQuestionAnswered || isLoading) return;
    setShowAnswer(true);
    setAnsweredQuestions(new Set([...answeredQuestions, currentQuestion.id]));
    setIsAnswered(true);
    setTimeout(() => {
      setCountSkip((prev) => prev + 1);
      nextQuestion();
    }, 1500);
  };

  const getDifficulty = () => {
    // if (!currentAnswer) return "mudah";
    // const wordLength = currentAnswer.length;
    // if (wordLength <= 4) return "mudah";
    // if (wordLength <= 7) return "sedang";
    return currentQuestion?.level;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-xl font-semibold text-gray-700">
            Memuat pertanyaan...
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Mohon tunggu sebentar
          </div>
        </div>
      </div>
    );
  }
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😅</div>
          <div className="text-xl font-semibold text-gray-700">
            Tidak ada pertanyaan
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Silakan kembali ke menu dan pilih level lain
          </div>
          <button
            onClick={onBackToSetup}
            className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
            ← Kembali ke Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-game">
      <div className="container">
        {/* Header */}
        <div className="header-game">
          <span>🎯</span>
          <h1>Quiz Tebak Kata</h1>
          <p>
            Tebak kata berdasarkan pertanyaan dalam Bahasa Inggris atau
            Indonesia! <br />
            saya membuat game ini untuk menghafal vocabulary
          </p>
        </div>
        <div className="card-back card">
          <button onClick={onBackToSetup}>← Kembali</button>
          <div>
            <p>
              Benar! <span className="font-bold text-blue-600">+10 Poin</span>
            </p>
            <p>
              & salah! <span className="font-bold text-red-600">-3 Poin</span>
            </p>
          </div>
          <div className="text-sm text-gray-600">
            Level:{" "}
            <span className="font-semibold capitalize">{selectedLevel}</span>
          </div>
        </div>

        {/* Score Board */}
        <ScoreBoard
          score={score}
          totalWords={questions.length}
          skipCount={countSkip}
          attempts={attempts}
          wrongAttempts={wrongAttempts}
          remainingWords={questions.length - answeredQuestions.size}
        />

        {/* Game Area */}
        <div className="card">
          {/* Progress */}
          <div className="card-area">
            <div className="box-area">
              <span className="text-sm text-gray-600">
                Pertanyaan {currentQuestionIndex + 1} dari {questions.length}
              </span>
              <span
                className={`px-3 py-1 capitalize rounded-full text-xs font-medium ${
                  ["mudah", "dailymudah"].includes(getDifficulty())
                    ? "bg-green-100 text-green-700"
                    : ["sedang", "dailysedang"].includes(getDifficulty())
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}>
                {getDifficulty()}
              </span>
              {/* <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 capitalize">
                {currentQuestion?.level}
              </span> */}
            </div>
          </div>

          {/* Question Display */}
          <div className="container-question">
            <div className="question-header">
              <span>
                {currentQuestion?.type === "english-to-indo" ? "🇮🇩" : "en"}
              </span>
              <p>
                {currentQuestion?.question}
              </p>
            </div>
            {/* Answer Input */}
            <div className="container-answer">
              <div className="box-answer">
                <div className="box-answer-sub">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="button-info">
                    <span className="text-lg">{showHint ? "" : "💡"}</span>
                    <span>{showHint ? "Sembunyikan" : "Petunjuk"}</span>
                  </button>
                  <div className="relative w-full">
                    <input
                      ref={inputRef}
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={
                        isGameOver || isQuestionAnswered || isWin || isAnswered
                      }
                      placeholder="Ketik jawaban Anda di sini..."
                      className=" w-full  px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      autoFocus
                    />
                    <div className="absolute w-full top-0">
                      {isCorrect === true && (
                        <div className=" p-3 bg-green-100 border border-green-300 rounded-lg animate-bounce">
                          <span className="text-green-700 font-bold text-lg">
                            🎉 Benar! +10 Poin
                          </span>
                        </div>
                      )}
                      {isCorrect === false && (
                        <div className=" p-3 bg-red-100 border border-red-300 rounded-lg animate-shake">
                          <span className="text-red-700 font-bold text-lg">
                            ❌ Salah! Coba lagi
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={skipQuestion}
                    disabled={isWin || isGameOver || isQuestionAnswered}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    ⏭️ Lewati
                  </button>
                </div>
              </div>
              {/* Control Buttons */}
              <div className="button-control">
                <button
                  onClick={() => {
                    setUserAnswer("");
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                  disabled={
                    isWin ||
                    isGameOver ||
                    isQuestionAnswered ||
                    userAnswer.length === 0
                  }
                  className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  ✖ Clear
                </button>
                <button
                  onClick={handleCheckAnswer}
                  disabled={
                    isWin ||
                    isGameOver ||
                    isQuestionAnswered ||
                    isAnswered ||
                    userAnswer.trim().length === 0
                  }
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  ✅ Check Answer
                </button>
              </div>
            </div>

            {/* Feedback */}

            {showAnswer && (
              <div className="mt-3 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                <span className="text-blue-700 font-bold text-lg">
                  💡 Jawaban: {currentAnswer}
                </span>
              </div>
            )}
          </div>

          {showHint && (
            <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-800">
                💡 Petunjuk: {currentQuestion?.hint}
              </span>
            </div>
          )}

          {/* Game Over */}
          {isGameOver && (
            <div className="card-game-over">
              <h2>🎮 Quiz Selesai!</h2>
              <p>
                Skor Akhir:{" "} 
                <span className="font-bold text-blue-600">{score}</span>
              </p>
              <p>Akurasi : {attempts > 0 ? Math.round(((attempts - wrongAttempts) / attempts) * 100) : 0}%</p>
              <p>Total Percobaan: {attempts}</p>
              <p>Terlewati: {countSkip}</p>
              <p>
                Jawaban Benar:{" "}
                {Number(attempts)-Number(wrongAttempts)}{" "}
                dari {questions.length} pertanyaan
              </p>
              <p>Jawaban Salah: {wrongAttempts}</p>
              <div className="flex gap-4 justify-center mt-4">
                <button
                  onClick={initializeGame}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
                  🔄 Main Lagi
                </button>
                <button
                  onClick={onBackToSetup}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                  🏠 Ke Menu
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <footer>
          <p>
            Ketik jawaban lengkap • Tekan Enter untuk check • Gunakan spasi
            untuk jawaban dengan spasi
          </p>
        </footer>
      </div>
    </div>
  );
};

export default GameBoard;
