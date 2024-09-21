import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router";
import Header from "../../components/layouts/header/header_layout_component";
import { db } from "../../config/db";
import { deleteFirebaseDoc } from "../../services/bingo_firebase_services";
import style from "./home.module.css";

export default function HomePage() {
  const [gameCode, setGameCode] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [joinModel, setJoinModel] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);
  const [error, setError] = useState("");
  const isBlur = isModalOpen || joinModel;
  
  const navigate = useNavigate();
  const handleCreateBingo = () => {
    createGame();
  };
  const handleJoinGame = () => {
    setJoinModel(true);
  }
  const joinGame = async () => {
    try {
      const gameRef = doc(db, "Bingo", gameCode);
      const gameSnap = await getDoc(gameRef);
  
      if (!gameSnap.exists()) {
        setError("Game was canceled or does not exist!");
        return;
      }
  
      const gameData = gameSnap.data();
  
      if (!gameData || !gameData.expiresAt) {
        setError("Game data is incomplete!");
        return;
      }
  
      const now = new Date();
  
      // Check if the game has expired
      if (now > gameData.expiresAt.toDate()) {
        setError("Game code has expired!");
        return;
      }
  
      // Check if the 'online' property exists before accessing it
      if (gameData.online === undefined) {
        setError("Unexpected game status!");
        return;
      }
  
      // Handle game joining logic based on the online property
      if (gameData.online === 1) {
        await updateDoc(gameRef, { online: 2 });
        navigate(`/bingo/player2/${gameCode}`); // Navigate to game page
      } else if (gameData.online === 2) {
        setError("Game is already full!");
      } else {
        setError("Unexpected game status!");
      }
    } catch (error) {
      console.error("Error joining game: ", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };
  
  
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
  
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
  
    try {
      await setDoc(doc(db, "Bingo", newGameCode), {
        play1Num: 0,
        play2Num: 0,
        turn: 1,
        win: 0,
        online: 1,
        createdAt: now,
        expiresAt: expiresAt // Store expiration time
      });
      console.log("Game created with code:", newGameCode); // Log success
    } catch (error) {
      console.error("Error creating game: ", error);
      // Optionally set an error state to inform the user
      setError("Failed to create game. Please try again.");
      return;
    }
  
    setModalOpen(true);
  
    const gameRef = doc(db, "Bingo", newGameCode);
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      const data = doc.data();
      if (data && data.online === 2) {
        setIsWaiting(false);
        navigate(`/bingo/player1/${newGameCode}`);  // Navigate to game page when player 2 joins
      }
    });
  
    return () => unsubscribe();
  };
  
  
  // Function to delete the game document if canceled
  const handleDeleteGame = async () => {
    try {
      // Await the result of deleteFirebaseDoc
      await deleteFirebaseDoc(gameCode);
      navigate("/");
    } catch (error) {
      console.error("Error deleting game:", error.message);
      setError(error.message); // Optional: Set error message to display in UI
    }
  };
  
  
  return (
    <>
      <Header></Header>
      <div className={`${style.HomeContainer} ${isBlur ? style.blur : ""}`}>
        <div className={style.StartGameCard}>
          <div className={style.buttons}>
            
            <div className={style.Start} onClick={handleCreateBingo}>Create Bingo</div>
            <div className={style.Start} onClick={handleJoinGame}>Join Bingo</div>
          </div>
        </div>
      </div>
      
      <Modal show={joinModel} onHide={() => setJoinModel(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Join Bingo Game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <><input
        type="text"
        placeholder="Enter Game Code"
        value={gameCode}
        onChange={(e) => setGameCode(e.target.value)}
      />
      <button onClick={joinGame}>Join Game</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}</>
        </Modal.Body>
      </Modal>

      <Modal show={isModalOpen} onHide={() => { setModalOpen(false); handleDeleteGame();}}>
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
    <Button onClick={() => { setModalOpen(false); handleDeleteGame();  }}>
      Cancel Game
    </Button> {/* Add cancel button */}
  </Modal.Body>
</Modal>

    </>
  );
}
