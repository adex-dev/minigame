import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css";
import React, { useState, useMemo } from "react";
import wordsDataB1 from "../data/words_b1.json";
import wordsDataB2 from "../data/words_b2.json";
import wordsDataC1 from "../data/words_c1.json";

interface GameSetupProps {
  onStartGame: (level: string, questionCount: number) => void;
  totalAvailableQuestions: number;
}

const GameSetup: React.FC<GameSetupProps> = ({
  onStartGame,
  totalAvailableQuestions,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>("mudah");
  const [questionCount, setQuestionCount] = useState<number>(5);
  let wordsData = [...wordsDataB1];
  const levels = [
    {
      id: "semua",
      label: "🌍 Semua Level",
      cfr: " - B1,B2,C1",
      color: "bg-gradient-to-r from-blue-400 to-purple-400",
    },
    {
      id: "mudah",
      label: "🟢 Mudah",
      cfr: " - B1",
      color: "bg-gradient-to-r from-green-400 to-green-500",
    },
    {
      id: "sedang",
      cfr: " - B2",
      label: "🟡 Sedang",
      color: "bg-gradient-to-r from-yellow-400 to-orange-400",
    },
    {
      id: "sulit",
      label: "🔴 Sulit",
      cfr: " - C1",
      color: "bg-gradient-to-r from-red-400 to-red-500",
    },
  ];

  const getMaxQuestions = (level: string) => {
    if (level === "semua") {
      return totalAvailableQuestions || 0;
    }
    if (level === "sedang") {
      wordsData = [...wordsDataB2];
    } else if (level === "sulit") {
      wordsData = [...wordsDataC1];
    }
    if (!wordsData || !Array.isArray(wordsData)) {
      return 0;
    }
    // Hitung jumlah soal berdasarkan level yang dipilih
    const filtered = wordsData.filter((w: any) => w.level === level);
    return filtered.length; // Setiap kata punya 2 pertanyaan
  };

  const maxQuestions = getMaxQuestions(selectedLevel);

  const questionOptions = useMemo(() => {
    if (maxQuestions === 0) {
      return [5, 10, 15, 20];
    }
    const options: number[] = [];
    const step = Math.max(1, Math.floor(maxQuestions * 0.2)); // 20% dari total

    // Mulai dari 5 atau step
    let start = Math.min(5, maxQuestions);

    // Generate options dengan kelipatan step
    for (let i = start; i <= maxQuestions; i += step) {
      options.push(i);
    }

    // Pastikan selalu ada opsi 5, 10, dan max
    if (!options.includes(5) && maxQuestions >= 5) options.unshift(5);
    if (!options.includes(10) && maxQuestions >= 10) {
      const index = options.findIndex((o) => o > 10);
      if (index !== -1) {
        options.splice(index, 0, 10);
      } else {
        options.push(10);
      }
    }
    if (!options.includes(maxQuestions) && maxQuestions > 0)
      options.push(maxQuestions);

    // Remove duplicates and sort
    return [...new Set(options)].sort((a, b) => a - b);
  }, [maxQuestions]);

  // Auto adjust question count when level changes
  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    const newMax = getMaxQuestions(level);

    if (questionCount > newMax) {
      setQuestionCount(Math.min(questionCount, newMax));
    }
  };

  const handleStart = async () => {
    if (maxQuestions === 0) {
      await Swal.fire({
        title: "Informasi",
        text: "Tidak ada pertanyaan yang tersedia!",
        icon: "info",
      });
      return;
    }
    if (questionCount > maxQuestions) {
      await Swal.fire({
        title: "Informasi",
        text: `Jumlah soal maksimal untuk level ini adalah ${maxQuestions}`,
        icon: "info",
      });
      return;
    }
    if (questionCount < 1) {
      await Swal.fire({
        title: "Informasi",
        text: `Minimal 10 soal`,
        icon: "info",
      });
      return;
    }
    onStartGame(selectedLevel, questionCount);
  };
  if (!wordsData || !Array.isArray(wordsData) || wordsData.length === 0) {
    return (
      <div className="main-game-setup">
        <div className="box-main-err">
          <div className="icon-warning">⚠️</div>
          <h2>Data Tidak Tersedia</h2>
          <p>Tidak ada data kata yang ditemukan.</p>
          <p>Pastikan file words.json ada dan berisi data.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="main-game-setup">
      <div className="w-full">
        <div className="container-setup">
          {/* Header */}
          <div className="container-setup-header">
            <div>🎯</div>
            <h1>Quiz Tebak Kata</h1>
            <p>Pilih level dan jumlah soal untuk memulai permainan</p>
          </div>

          {/* Level Selection */}
          <div className="container-level">
            <div>
              <div className="space-y-3">
                <label className="choose-level-label">📊 Pilih Level</label>
                <div className="choose-level">
                  {levels.map((level) => {
                    const levelMax = getMaxQuestions(level.id);
                    return (
                      <button
                        key={level.id}
                        onClick={() => handleLevelChange(level.id)}
                        className={`button-level ${
                          selectedLevel === level.id
                            ? `${level.color} button-level-active`
                            : "button-level-inactive"
                        }`}>
                        <span className="button-header">
                          {level.label + level.cfr}
                        </span>
                        <span>{levelMax} soal</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Count */}
              <div className="space-y-3">
                <div className="box-question-count">
                  <label>📝 Pilih Jumlah Soal Yang akan ditampilkan</label>
                  <span>Maks: {maxQuestions} soal</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {questionOptions.map((num: any) => (
                    <button
                      key={num}
                      onClick={async () => {
                        if (num <= maxQuestions) {
                          setQuestionCount(num);
                        } else {
                          await Swal.fire({
                            title: "Informasi",
                            text: `Maksimal ${maxQuestions} soal untuk level ini`,
                            icon: "info",
                          });
                        }
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        questionCount === num && num <= maxQuestions
                          ? "bg-blue-500 text-white shadow-lg scale-105"
                          : num <= maxQuestions
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                      }`}
                      disabled={num > maxQuestions}>
                      {num}
                    </button>
                  ))}
                </div>

                {/* Custom input for question count */}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm text-gray-600">Atau:</span>
                  <input
                    type="number"
                    min={1}
                    max={maxQuestions}
                    value={questionCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1 && val <= maxQuestions) {
                        setQuestionCount(val);
                      }
                    }}
                    className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <span className="text-sm text-gray-500">soal</span>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="card-info">
              <div>
                <span className="text-2xl">ℹ️</span>
                <div className="card-info-subheader">
                  <p>Info Game:</p>
                  <p>
                    • Setiap kata memiliki 2 pertanyaan (Inggris → Indonesia &
                    Indonesia → Inggris)
                  </p>
                  <p>• Jawaban benar = +10 poin</p>
                  <p>
                    • Level{" "}
                    {selectedLevel === "semua"
                      ? "semua akan diacak"
                      : selectedLevel}
                  </p>
                  <p>
                    • Total soal tersedia:{" "}
                    {maxQuestions > 1 ? maxQuestions : "belum ditentukan"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
            🚀 Mulai Permainan
          </button>

          {/* Footer */}
          <div className="text-center text-sm text-gray-400">
            Total {totalAvailableQuestions} pertanyaan tersedia
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;
