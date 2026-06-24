import React from 'react';

interface KeyboardProps {
  onLetterClick: (letter: string) => void;
  guessedLetters: string[];
  isGameOver: boolean;
}

const Keyboard: React.FC<KeyboardProps> = ({ onLetterClick, guessedLetters, isGameOver }) => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  const getKeyStatus = (letter: string): string => {
    if (guessedLetters.includes(letter)) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed transform scale-95';
    }
    return 'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:scale-105 active:scale-95';
  };

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl shadow-lg">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5 md:gap-2">
          {row.map((letter) => (
            <button
              key={letter}
              onClick={() => onLetterClick(letter)}
              disabled={guessedLetters.includes(letter) || isGameOver}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-lg font-bold text-sm md:text-base transition-all duration-200 shadow-md ${getKeyStatus(
                letter
              )} disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none`}
            >
              {letter}
            </button>
          ))}
        </div>
      ))}
      <div className="mt-2 text-xs text-gray-400">
        Klik huruf atau gunakan keyboard untuk menebak
      </div>
    </div>
  );
};

export default Keyboard;