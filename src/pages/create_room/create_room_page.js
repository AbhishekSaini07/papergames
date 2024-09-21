// CreateBingo.js
import React, { useState } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import {db} from "../../config/db";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CreateBingoPage = () => {
  const [gameCode, setGameCode] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);
  const navigate = useNavigate();

  const generateGameCode = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return code;
  };

  const createGame = async () => {
    const newGameCode = generateGameCode();
    setGameCode(newGameCode);

    await setDoc(doc(db, "Bingo", newGameCode), {
      play1Num: 0,
      play2Num: 0,
      turn: 1,
      win: 0,
      online: 1,
    });

    setModalOpen(true);

    const unsubscribe = onSnapshot(doc(db, "Bingo", newGameCode), (doc) => {
      const data = doc.data();
      if (data.online === 2) {
        setIsWaiting(false);
        navigate(`/bingo/player1/${newGameCode}`);  // Navigate to the game page when player 2 joins
      }
    });

    return () => unsubscribe();
  };

  return (
    <div>
      <Button onClick={createGame}>Create Bingo</Button>

      <Modal show={isModalOpen} onHide={() => setModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Game Created</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Your Game Code: {gameCode}</h5>
          <Button onClick={() => navigator.clipboard.writeText(gameCode)}>
            Copy Game Code
          </Button>
          <br />
          {isWaiting ? (
            <div>
              <Spinner animation="border" />
              <p>Waiting for the second player to join...</p>
            </div>
          ) : (
            <p>Player 2 has joined! Starting the game...</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CreateBingoPage;
