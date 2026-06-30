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
  skipCount,
  totalWords,
  attempts,
  wrongAttempts,
  remainingWords,
}) => {
  const correctAttempts = attempts - wrongAttempts;
  const accuracy = attempts > 0 ? Math.round((correctAttempts / attempts) * 100) : 0;

  return (
    <div className="my-2 grid grid-cols-2 md:grid-cols-7 gap-3 p-4 bg-white rounded-xl shadow-lg">
      <Card containerClass="bg-blue-50" title="⭐ Skor" valueClass="text-blue-600" amount={score} />
      <Card containerClass="bg-green-50" title="📝 Total Soal" valueClass="text-green-600" amount={totalWords} />
      <Card containerClass="bg-orange-50" title="⏭ Terlewati" valueClass="text-orange-600" amount={skipCount} />
      <Card containerClass="bg-green-50" title="✅ Benar" valueClass="text-green-600" amount={correctAttempts} />
      <Card containerClass="bg-red-50" title="❌ Salah" valueClass="text-red-600" amount={wrongAttempts} />
      <Card containerClass="bg-purple-50" title="📌 Sisa" valueClass="text-purple-600" amount={remainingWords} />
      <Card containerClass="bg-indigo-50" title="🎯 Akurasi" valueClass="text-indigo-600" amount={accuracy} />
    </div>
  );
};

export default ScoreBoard;


interface CardProps {
  containerClass: string;
  valueClass: string;
  title: string;
  amount: number;
}
const Card: React.FC<CardProps> = ({
  containerClass,
  title,
  valueClass,
  amount,
}) => {
  return(
    <div className={`text-center p-2 rounded-lg ${containerClass}`}>
        <div className="text-base font-mono text-gray-500">{title}</div>
        <div className={`text-xl font-bold ${valueClass}`}>{amount} {valueClass ==='text-indigo-600'?' %':''}</div>
      </div>
  )
}