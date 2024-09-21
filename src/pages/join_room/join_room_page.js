// JoinBingo.js
import React, { useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../config/db";
import { useNavigate } from "react-router-dom";

const JoinBingoPage = () => {
  const [gameCode, setGameCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleJoinGame = async () => {
    try {
      const gameRef = doc(db, "Bingo", gameCode);
      const gameSnap = await getDoc(gameRef);

      if (gameSnap.exists()) {
        const gameData = gameSnap.data();
        if (gameData.online === 1) {
          await updateDoc(gameRef, { online: 2 });
          navigate(`/bingo/player2/${gameCode}`); // Navigate to the game page
        } else if (gameData.online === 2) {
          setError("Game is already full!");
        }
      } else {
        setError("Invalid game code!");
      }
    } catch (error) {
      console.error("Error joining game: ", error);
    }
  };

  return (
    <div>
      <h3>Join Bingo Game</h3>
      <input
        type="text"
        placeholder="Enter Game Code"
        value={gameCode}
        onChange={(e) => setGameCode(e.target.value)}
      />
      <button onClick={handleJoinGame}>Join Game</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default JoinBingoPage;
