import React from 'react';

interface ScoreBoardProps {
  score: number;
  totalWords: number;
  attempts: number;
  wrongAttempts: number;
  remainingWords: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  totalWords,
  attempts,
  wrongAttempts,
  remainingWords,
}) => {
  const correctAttempts = attempts - wrongAttempts;
  const accuracy = attempts > 0 ? Math.round((correctAttempts / attempts) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-white rounded-xl shadow-lg">
      <div className="text-center p-2 bg-blue-50 rounded-lg">
        <div className="text-xs text-gray-500">⭐ Skor</div>
        <div className="text-xl font-bold text-blue-600">{score}</div>
      </div>
      <div className="text-center p-2 bg-green-50 rounded-lg">
        <div className="text-xs text-gray-500">📝 Total</div>
        <div className="text-xl font-bold text-green-600">{totalWords}</div>
      </div>
      <div className="text-center p-2 bg-orange-50 rounded-lg">
        <div className="text-xs text-gray-500">🔄 Coba</div>
        <div className="text-xl font-bold text-orange-600">{attempts}</div>
      </div>
      <div className="text-center p-2 bg-red-50 rounded-lg">
        <div className="text-xs text-gray-500">❌ Salah</div>
        <div className="text-xl font-bold text-red-600">{wrongAttempts}</div>
      </div>
      <div className="text-center p-2 bg-purple-50 rounded-lg">
        <div className="text-xs text-gray-500">📌 Sisa</div>
        <div className="text-xl font-bold text-purple-600">{remainingWords}</div>
      </div>
      <div className="text-center p-2 bg-indigo-50 rounded-lg">
        <div className="text-xs text-gray-500">🎯 Akurasi</div>
        <div className="text-xl font-bold text-indigo-600">{accuracy}%</div>
      </div>
    </div>
  );
};

export default ScoreBoard;