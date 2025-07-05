import { useState, useEffect, useCallback } from "react";
import { FiGithub, FiSun, FiMoon } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  // Game state
  const [numbers, setNumbers] = useState([]);
  const [covered, setCovered] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [coverTime, setCoverTime] = useState(1000);
  const [countdown, setCountdown] = useState(0);
  const [showNumbers, setShowNumbers] = useState(false);
  const [numberCount, setNumberCount] = useState(10);
  const [darkMode, setDarkMode] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("vme-darkMode", newDarkMode.toString());
  };

  // Load stats and theme from localStorage
  useEffect(() => {
    const savedWins = localStorage.getItem("vme-wins");
    const savedLosses = localStorage.getItem("vme-losses");
    const savedDarkMode = localStorage.getItem("vme-darkMode");

    if (savedWins) setWins(parseInt(savedWins));
    if (savedLosses) setLosses(parseInt(savedLosses));
    if (savedDarkMode) setDarkMode(savedDarkMode === "true");
  }, []);

  // Save stats to localStorage immediately when they change
  const updateStats = useCallback((newWins, newLosses) => {
    setWins(newWins);
    setLosses(newLosses);
    localStorage.setItem("vme-wins", newWins.toString());
    localStorage.setItem("vme-losses", newLosses.toString());
  }, []);

  // Generate sequential numbers in random positions
  const generateNumbers = useCallback(() => {
    const nums = [];
    for (let i = 0; i < numberCount; i++) {
      nums.push({
        value: i,
        x: Math.random() * 90 + 2,
        y: Math.random() * 95 + 5,
        id: i,
      });
    }
    setNumbers(nums);
    setCovered(false);
    setSelectedNumbers([]);
    setGameResult(null);
  }, [numberCount]);

  // Start the game
  const startGame = () => {
    setGameActive(true);
    generateNumbers();
    setCountdown(3);

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setShowNumbers(true);

          setTimeout(() => {
            setCovered(true);
            setShowNumbers(false);
          }, coverTime);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle number selection
  const handleNumberClick = (num) => {
    if (
      !covered ||
      !gameActive ||
      selectedNumbers.some((n) => n.id === num.id)
    ) {
      return;
    }

    // Check if the clicked number is the next in sequence
    const nextExpectedValue = selectedNumbers.length;
    if (num.value !== nextExpectedValue) {
      setGameResult("loss");
      updateStats(wins, losses + 1);
      setGameActive(false);
      return;
    }

    const newSelected = [...selectedNumbers, num];

    // Check if all numbers are selected in correct order
    if (newSelected.length === numbers.length) {
      setGameResult("win");
      updateStats(wins + 1, losses);
      setGameActive(false);
    }

    setSelectedNumbers(newSelected);
  };

  return (
    <div
      className={`min-h-screen p-4 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div
        className={`w-full max-w-3xl mx-auto rounded-lg p-0.5 bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg ${
          darkMode ? "shadow-purple-900" : "shadow-purple-200"
        }`}
      >
        <div
          className={`rounded-lg p-6 transition-colors duration-300 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center space-x-4 order-1 sm:order-none">
              <div className="text-red-500 font-bold">L: {losses}</div>
              <div className="text-green-500 font-bold">W: {wins}</div>
            </div>

            {/* Centered Logo with Theme Toggle */}
            <div className="flex items-center space-x-4 order-3 sm:order-none sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
              <div className="text-2xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                VME
              </div>

              {/* New Theme Toggle with Framer Motion */}
              <div
                className={`relative flex items-center p-1 rounded-full ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
                onClick={toggleDarkMode}
              >
                <div className="flex items-center relative z-10">
                  <FiSun
                    size={16}
                    className={`mx-1 ${
                      !darkMode ? "text-yellow-500" : "text-gray-400"
                    }`}
                  />
                  <FiMoon
                    size={16}
                    className={`mx-1 ${
                      darkMode ? "text-blue-300" : "text-gray-500"
                    }`}
                  />
                </div>
                <motion.div
                  className="absolute h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 z-0"
                  initial={{ x: 0 }}
                  animate={{ x: darkMode ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ left: 2 }}
                />
              </div>
            </div>

            <div
              className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-500"
              } order-2 sm:order-none`}
            >
              {gameActive
                ? covered
                  ? "Select in order (0,1,2...)"
                  : showNumbers
                  ? "Memorize!"
                  : `Ready? (${countdown})`
                : "Start Game"}
            </div>
          </div>

          {/* Game area */}
          <div
            className={`relative border-2 rounded-lg h-64 mb-6 overflow-hidden transition-colors duration-300 ${
              darkMode
                ? "border-gray-600 bg-gray-700"
                : "border-gray-300 bg-gray-50"
            }`}
            style={{ minHeight: "256px" }}
          >
            <AnimatePresence>
              {gameActive && countdown > 0 && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-4xl font-bold z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {countdown}
                </motion.div>
              )}
            </AnimatePresence>

            {numbers.map((num) => (
              <motion.div
                key={num.id}
                className={`absolute flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all duration-200
                  ${
                    covered || !showNumbers
                      ? selectedNumbers.some((n) => n.id === num.id)
                        ? "opacity-0"
                        : darkMode
                        ? "bg-gray-600 border-gray-500"
                        : "bg-white border-gray-300"
                      : "bg-blue-500 text-white font-bold"
                  }
                  border-2
                `}
                style={{
                  left: `${num.x}%`,
                  top: `${num.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={() => handleNumberClick(num)}
                whileTap={{ scale: 0.9 }}
              >
                {showNumbers && num.value + 1}
              </motion.div>
            ))}

            <AnimatePresence>
              {!gameActive && (
                <motion.div
                  className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {numbers.length === 0 ? (
                    "Click Start to begin"
                  ) : gameResult === "win" ? (
                    <span className="text-green-500">You Won! 🎉</span>
                  ) : gameResult === "loss" ? (
                    <span className="text-red-500">You Lost! 😢</span>
                  ) : (
                    "Game Over!"
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer with controls */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <label
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Numbers:
                  </label>
                  <input
                    type="number"
                    max="10"
                    value={numberCount}
                    onChange={(e) =>
                      setNumberCount(
                        Math.min(10, Math.max(1, parseInt(e.target.value)))
                      )
                    }
                    className={`border rounded px-2 py-1 w-16 text-sm ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-black"
                    }`}
                    disabled={gameActive}
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <label
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Delay (ms):
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    step="100"
                    value={coverTime}
                    onChange={(e) => setCoverTime(parseInt(e.target.value))}
                    className={`border rounded px-2 py-1 w-20 text-sm ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-black"
                    }`}
                    disabled={gameActive}
                  />
                </div>
              </div>

              <motion.button
                onClick={startGame}
                disabled={gameActive}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 w-full sm:w-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {gameActive ? "Game in Progress" : "Start Game"}
              </motion.button>
            </div>

            {/* GitHub footer */}
            <div
              className={`text-center mt-6 pt-4 border-t ${
                darkMode
                  ? "border-gray-700 text-gray-400"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              <p className="text-sm mb-2">
                Support this project by starring on GitHub
              </p>
              <motion.a
                href="https://github.com/ziaurrehman931554/VisualMemoryGame"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiGithub className="mr-2" />
                Star on GitHub
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
