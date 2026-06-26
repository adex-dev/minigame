import GameBoard from "./components/GameBoard";
import GameSetup from "./components/GameSetup";
import wordsDataB1 from "./data/words_b1.json";
import wordsDataB2 from "./data/words_b2.json";
import wordsDataC1 from "./data/words_c1.json";
import wordsDataDayliB1 from "./data/b1_daily.json";
import { useState } from "react";
import "./App.css";
function App() {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<string>("semua");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const wordsData = [
    ...wordsDataB1,
    ...wordsDataB2,
    ...wordsDataC1,
    ...wordsDataDayliB1,
  ].map((item, index) => ({
    ...item,
    id: index + 1,
  }));
  const totalQuestions =
    wordsData && Array.isArray(wordsData) ? wordsData.length : 0;

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
