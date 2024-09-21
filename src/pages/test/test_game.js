// GamePage.js
import { doc, onSnapshot } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/layouts/header/header_layout_component";
import { db } from "../../config/db";
import {
  deleteFirebaseDoc,
  setFirebaseData,
} from "../../services/bingo_firebase_services";
import { shuffle } from "../../utils/bingo_util";
import style from "../bingo/bingo.module.css";

const GamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameCode } = useParams();
  const [prevPlayNum, setPrevPlayNum] = useState(-1);
  const [winningIterator, setWinningIterator] = useState(0);
  const { gamePlayer } = location.state;
  const [strickoutCells, setStrickoutCells] = useState(Array(25).fill(false));
  const [winningPositions, setWinningPositions] = useState([
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    [0, 6, 12, 18, 24],
    [20, 16, 12, 8, 4],
  ]);
  const [arr, setArr] = useState(
    shuffle(Array.from({ length: 26 }, (_, index) => index + 1).slice(1))
  );
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "Bingo", gameCode), (doc) => {
      if (doc.exists()) {
        const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        console.log(source, " data: ", doc.data());
        if (doc.data().win != 0) {
          alert("end game");
        }
        setGameData(doc.data());
      } else {
        console.log("Document does not exist.");
      }
    });

    // Cleanup subscription when component unmounts
    return () => unsub();
  }, []);
  useEffect(() => {
    if (gameData) {
      // Only call checkData when gameData has been set
      if (gamePlayer == 1 && prevPlayNum != gameData.play2Num) {
        console.log(gameData.play2Num + "nhi hua");
        let index = findindex(gameData.play2Num);
        setStrickoutCells((prevCells) => {
          const newCells = [...prevCells];
          newCells[index] = true;
          return newCells;
        });
        setPrevPlayNum(gameData.play2Num);
      } else if (gamePlayer == 2 && prevPlayNum != gameData.play1Num) {
        console.log(gameData.play1Num + "nhi hua");
        let index = findindex(gameData.play1Num);
        setStrickoutCells((prevCells) => {
          const newCells = [...prevCells];
          newCells[index] = true;
          return newCells;
        });
        setPrevPlayNum(gameData.play1Num);
      }
    }
  }, [gameData]);
  useEffect(() => {
    console.log(strickoutCells);
    matchWin()
      
    
  }, [strickoutCells]);

  // useEffect(() => {
  //   const fetchGame = async () => {
  //     const gameRef = doc(db, "Bingo", gameCode);
  //     const gameSnap = await getDoc(gameRef);

  //     if (gameSnap.exists()) {
  //       setGameData(gameSnap.data());
  //     }
  //   };

  //   fetchGame();
  // }, [gameCode]);

  const matchWin = useCallback(() => {
    const cells = document.querySelectorAll(".main-table-cell");
    return winningPositions.some((combination) => {
      let ite = 0;
      combination.forEach((index) => {
        if (cells[index].classList.contains(style.strickout)) {
          ite++;
          console.log("Strick at: " + cells[index].textContent);
        }
      });
      console.log("done for 1 combo");

      if (ite == 5) {
        console.log("oo ya");
        let indexWin = winningPositions.indexOf(combination);
        setWinningPositions((winningPositions) => {
          const updatedPositions = [...winningPositions];
          updatedPositions.splice(indexWin, 1);
          return updatedPositions;
        });
      }

      return combination.every((index) =>
        cells[index].classList.contains(style.strickout)
      );
    });
  }, [winningPositions]);

  const findindex = useCallback(
    (num) => {
      let index = -1;
      let field = num;
      console.log("welcome");
      console.log(field);
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] == field) {
          index = i;
        }
      }
      return index;
    },
    [arr, gameData]
  );
  const checkData = () => {
    console.log("check data " + gameData);
  };
  // const handleServerClick = useCallback(
  //   (num) => {
  //     let index = findindex(num);
  //     setStrickoutCells((prevCells) => {
  //       const newCells = [...prevCells];
  //       newCells[index] = true;
  //       return newCells;
  //     });

  //     if (matchWin()) {
  //       document.querySelectorAll(`.${style.lettersBingo}`)
  //       [winningIterator].classList.add(style.showBingo);

  //       setWinningIterator(winningIterator + 1);

  //     }
  //   },
  //   [matchWin, winningIterator]
  // );
  if (!gameData) return <h2>loading</h2>;
  const handleUpdateTurnField = async () => {
    try {
      setFirebaseData(gameCode, "turn", gamePlayer == 1 ? 2 : 1);
    } catch (error) {
      console.log(error.message);
    }
  };
  const handleUpdateWinField = async () => {
    try {
      setFirebaseData(gameCode, "win", gamePlayer);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleResetWinField = async () => {
    try {
      setFirebaseData(gameCode, "win", 0);
    } catch (error) {
      console.log(error.message);
    }
  };
  const handleUpdatePlayNumField = async (num) => {
    try {
      let field = `play${gamePlayer}Num`;
      setFirebaseData(gameCode, field, num);
    } catch (error) {
      console.log(error.message);
    }
  };
  const handleClick = (index) => {
    handleUpdatePlayNumField(arr[index]);
    setStrickoutCells((prevCells) => {
      const newCells = [...prevCells];
      newCells[index] = true;
      return newCells;
    });

    handleUpdateTurnField();
  };
  // useEffect(() => {

  //   if (gameData.win == 1) {
  //     alert("you Win");
  //     handleResetWinField();
  //   }
  //   else if (gameData.win == 2) {
  //     alert("you Lost");

  //   }
  //   //window.location.reload();

  // }, [gameData]);

  const handleCheck = () => {
    document
      .querySelectorAll(`.${style.lettersBingo}`)
      [winningIterator].classList.add(style.showBingo);

    setWinningIterator(winningIterator + 1);
  };
  const endGame = async () => {
    try {
      deleteFirebaseDoc(gameCode);
    } catch (error) {
      console.log(error.message);
    }
  };

  if (!gameData) return <h2>loading</h2>;

  return (
    <div className="nm">
      <Header />

      {gamePlayer == 1 ? (
        <h2>{gameData.play2Num}</h2>
      ) : (
        <h2>{gameData.play1Num}</h2>
      )}

      <Container fluid>
        <Row>
          <Col>
            <div className={style.bx1}>
              <table id={style.tblBingo}>
                <tbody>
                  {Array.from({ length: Math.ceil(arr.length / 5) }, (_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }, (_, j) => {
                        const cellIndex = i * 5 + j;
                        return (
                          <td
                            key={cellIndex}
                            id={arr[cellIndex].toString()}
                            style={{ height: "20%", width: "20%" }}
                            className={`main-table-cell ${
                              strickoutCells[cellIndex] ? style.strickout : ""
                            }`}
                            onClick={() => handleClick(cellIndex)}
                          >
                            <div className={style.cellformat}>
                              {arr[cellIndex]}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Col>
          <Col>
            <Row>
              <Col>
                <div className={style.bx2}>
                  <h3>Bingo Game</h3>
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <div className={style.bx2}>
                  <h3>
                    {gamePlayer == gameData.turn
                      ? "Your Turn"
                      : "Second Player Turn"}
                  </h3>
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <div className={style.bx2}>
                  <div className={style.letterdiv}>
                    <table id={style.tblLetter}>
                      <tbody>
                        <tr>
                          <td className={style.lettersBingo}>B</td>
                          <td className={style.lettersBingo}>I</td>
                          <td className={style.lettersBingo}>N</td>
                          <td className={style.lettersBingo}>G</td>
                          <td className={style.lettersBingo}>O</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default GamePage;
