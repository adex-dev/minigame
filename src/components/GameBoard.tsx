import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css";
import ScoreBoard from "./ScoreBoard";
import wordsData from "../data/words.json";

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

  const pesan = async (messages: string, action: any,icon:any) => {
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
      if (!wordsData || !Array.isArray(wordsData) || wordsData.length === 0) {
        await pesan("Data kata tidak tersedia!","informasi", "info");
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
        await pesan(`Tidak ada kata dengan level "${selectedLevel}"!`,"informasi", "info");
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
          pesan("Tidak ada pertanyaan yang tersedia untuk level ini!","informasi", "info");
          onBackToSetup();
          return;
        }
        setQuestions(selectedQuestions);
        setCurrentQuestionIndex(0);
        setUserAnswer("");
        setScore(0);
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
        "Terjadi kesalahan saat memuat game. Silakan kembali ke menu.","kesalahan",
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
      await pesan("Silakan masukkan jawaban terlebih dahulu!","informasi", "info");
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
      nextQuestion();
    }, 1500);
  };

  const getDifficulty = () => {
    if (!currentAnswer) return "Mudah";
    const wordLength = currentAnswer.length;
    if (wordLength <= 4) return "Mudah";
    if (wordLength <= 7) return "Sedang";
    return "Sulit";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            🎯 Quiz Tebak Kata
          </h1>
          <p className="text-gray-600 mt-2">
            Tebak kata berdasarkan pertanyaan dalam Bahasa Inggris atau
            Indonesia! <br />
            saya membuat game ini untuk menghafal vocabullary
          </p>
        </div>
        <div className="flex justify-between items-center">
          <button
            onClick={onBackToSetup}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors">
            ← Kembali
          </button>
          <div className="text-sm text-gray-600">
            Level:{" "}
            <span className="font-semibold capitalize">{selectedLevel}</span>
          </div>
        </div>

        {/* Score Board */}
        <ScoreBoard
          score={score}
          totalWords={questions.length}
          attempts={attempts}
          wrongAttempts={wrongAttempts}
          remainingWords={questions.length - answeredQuestions.size}
        />

        {/* Game Area */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 space-y-6">
          {/* Progress */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Pertanyaan {currentQuestionIndex + 1} dari {questions.length}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  getDifficulty() === "Mudah"
                    ? "bg-green-100 text-green-700"
                    : getDifficulty() === "Sedang"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}>
                {getDifficulty()}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 capitalize">
                {currentQuestion?.level}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              ✅ {answeredQuestions.size} terjawab
            </span>
          </div>

          {/* Question Display */}
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl">
                {currentQuestion?.type === "english-to-indo" ? "🇮🇩" : "🇬🇧"}
              </span>
              <p className="text-xl font-semibold text-gray-800">
                {currentQuestion?.question}
              </p>
            </div>

            {/* Answer Input */}
            <div className="mt-4">
              <div className="flex flex-col items-center gap-3">
                <div className="flex flex-row w-full gap-3">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex flex-col text-sm text-wrap px-4 p-1 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-lg font-medium transition-colors">
                    <span>
                      {
                        showHint? "":"💡"
                      }
                    </span>
                    <span>{showHint
                      ? "Sembunyikan Petunjuk"
                      : "Tampilkan Petunjuk"}</span>
                  </button>
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
                  <button
                    onClick={skipQuestion}
                    disabled={isWin || isGameOver || isQuestionAnswered}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    ⏭️ Lewati
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Tekan Enter atau klik tombol Check Answer
                </div>
              </div>
            </div>

            {/* Feedback */}
            {isCorrect === true && (
              <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg animate-bounce">
                <span className="text-green-700 font-bold text-lg">
                  🎉 Benar! +10 Poin
                </span>
              </div>
            )}
            {isCorrect === false && (
              <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg animate-shake">
                <span className="text-red-700 font-bold text-lg">
                  ❌ Salah! Coba lagi
                </span>
              </div>
            )}
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

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
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

          {/* Game Over */}
          {isGameOver && (
            <div className="text-center p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
              <h2 className="text-2xl font-bold text-purple-800">
                🎮 Quiz Selesai!
              </h2>
              <p className="text-lg mt-2">
                Skor Akhir:{" "}
                <span className="font-bold text-blue-600">{score}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Total Percobaan: {attempts}
              </p>
              <p className="text-sm text-gray-600">
                Jawaban Benar: {answeredQuestions.size} dari {questions.length}{" "}
                pertanyaan
              </p>
              <p className="text-sm text-gray-600">
                Jawaban Salah: {wrongAttempts}
              </p>
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
        <div className="text-center text-sm text-gray-500">
          <p>
            Ketik jawaban lengkap • Tekan Enter untuk check • Gunakan spasi
            untuk jawaban dengan spasi
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
