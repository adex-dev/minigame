import GameBoard from "./components/GameBoard";
import GameSetup from './components/GameSetup';
import wordsData from "./data/words.json";
import { useState } from "react";

function App() {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('semua');
  const [questionCount, setQuestionCount] = useState<number>(5);
  
  const totalQuestions = wordsData && Array.isArray(wordsData) ? wordsData.length : 0;


  const handleStartGame = (level: string, count: number) => {
    setSelectedLevel(level);
    setQuestionCount(count);
    setGameStarted(true);
  };
  const handleBackToSetup = () => {
    setGameStarted(false);
  };

  return (
    <div className="App">
      {!gameStarted ? (
        <GameSetup
          onStartGame={handleStartGame}
          totalAvailableQuestions={totalQuestions}
        />
      ) : (
        <GameBoard
          selectedLevel={selectedLevel}
          questionCount={questionCount}
          onBackToSetup={handleBackToSetup}
        />
      )}
    </div>
  );
}
export default App;
