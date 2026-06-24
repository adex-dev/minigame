import React from 'react';

interface WordDisplayProps {
  word: string;
  guessedLetters: string[];
  isGameOver: boolean;
  isAnswerMode?: boolean;
}

const WordDisplay: React.FC<WordDisplayProps> = ({ 
  word, 
  guessedLetters, 
  isGameOver,
  isAnswerMode = false 
}) => {
  // Split word into characters
  const chars = word.split('');
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2 flex-wrap justify-center">
        {chars.map((char, index) => {
          const isLetter = /[a-zA-Z]/.test(char);
          const upperChar = char.toUpperCase();
          
          if (!isLetter) {
            return (
              <div key={index} className="w-8 flex items-center justify-center">
                <span className="text-gray-400">{char}</span>
              </div>
            );
          }
          
          // In answer mode, always show the letter
          if (isAnswerMode) {
            return (
              <div
                key={index}
                className="w-12 h-14 border-2 border-blue-400 bg-blue-50 flex items-center justify-center text-2xl font-bold text-blue-600 rounded-lg"
              >
                {upperChar}
              </div>
            );
          }
          
          const isGuessed = guessedLetters.includes(upperChar);
          const showChar = isGuessed || isGameOver;
          
          return (
            <div
              key={index}
              className={`w-12 h-14 border-b-4 flex items-center justify-center text-2xl font-bold bg-gray-50 rounded-t-lg transition-all duration-300 ${
                showChar ? 'border-green-500 text-green-600' : 'border-blue-500'
              }`}
            >
              {showChar ? upperChar : '_'}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WordDisplay;