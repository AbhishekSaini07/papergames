// HomePage.js
import React from "react";
import { useNavigate } from "react-router-dom";

const TestHomePage = () => {
  const navigate = useNavigate();

  const handleCreateGame = () => {
    navigate("/create-bingo");
  };

  const handleJoinGame = () => {
    navigate("/join-bingo");
  };

  return (
    <div>
      <h1>Welcome to Bingo Game</h1>
      <button onClick={handleCreateGame}>Create Bingo</button>
      <button onClick={handleJoinGame}>Join Bingo</button>
    </div>
  );
};

export default TestHomePage;
