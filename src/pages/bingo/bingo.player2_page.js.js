import "bootstrap/dist/css/bootstrap.min.css";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { useParams } from "react-router";
import Header from "../../components/layouts/header/header_layout_component";
import { db } from "../../config/db";
import { setFirebaseData } from "../../services/bingo_firebase_services";
import style from "./bingo.module.css";
const BingoBoard2 = () => {
  const [strickoutCells, setStrickoutCells] = useState(Array(25).fill(false));
  const gamePlayer = 2;
  const { gameCode } = useParams();
  const shuffle = (arr) => {
    let currentIndex = arr.length,
      randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [arr[currentIndex], arr[randomIndex]] = [
        arr[randomIndex],
        arr[currentIndex],
      ];
    }

    return arr;
  };

  const [arr, setArr] = useState(
    shuffle(Array.from({ length: 26 }, (_, index) => index + 1).slice(1))
  );
  
  const [winningIterator, setWinningIterator] = useState(0);
  const [player, setPlayer] = useState(0);
  const [play2Num, setNum] = useState(0);
  const [win, setWin] = useState(0);
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
  const matchWin = useCallback(() => {
    const cells = document.querySelectorAll(".main-table-cell");
    return winningPositions.some((combination) => {
      let ite = 0;
      combination.forEach((index) => {
        if (cells[index].classList.contains(style.strickout)){ ite++;
         console.log("Strick at: "+ cells[index].textContent);
        };
      });

      if (ite === 5) {
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
  const findindex = useCallback(() => {
    let index = -1;
    console.log("welcome");
    console.log(play2Num);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == play2Num) {
        index = i;
      }
    }
    return index;
  }, [arr, play2Num]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "Bingo", gameCode), (doc) => {
      if (doc.exists()) {
        const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        console.log(source, " data: ", doc.data());
        setPlayer(doc.data().turn);
      } else {
        console.log("Document does not exist.");
        setPlayer(null);
      }
    });

    // Cleanup subscription when component unmounts
    return () => unsub();
  }, []);
  const handleServerClick = useCallback(
    (index) => {
      setStrickoutCells((prevCells) => {
        const newCells = [...prevCells];
        newCells[index] = true;
        return newCells;
      });

      if (matchWin()) {
        document.querySelectorAll(`.${style.lettersBingo}`)
        [winningIterator].classList.add(style.showBingo);
    
            setWinningIterator(winningIterator + 1);

        if (winningIterator === 4) {
          handleUpdateWinField();
          // alert('B I N G O');
          // window.location.reload();
        }
      }
    },
    [matchWin, winningIterator]
  );

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "Bingo", gameCode), (doc) => {
      if (doc.exists()) {
        const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        console.log(source, " data: ", doc.data());
        setNum(doc.data().play2Num);
        let num = findindex();
        handleServerClick(num);
      } else {
        console.log("Document does not exist.");
        setNum(0);
      }
    });

    // Cleanup subscription when component unmounts
    return () => unsub();
  }, [findindex, handleServerClick]);
  
  const handleUpdateTurnField = async () => {
    try{
      setFirebaseData(gameCode,"turn",1);
    }
    catch(error){
      console.log(error.message);
    }
  };
  const handleUpdateWinField = async () => {
    try{
      setFirebaseData(gameCode,"win",gamePlayer);
    }
    catch(error){
      console.log(error.message);
    }
  };
  const handleResetWinField = async () => {
    try{
      setFirebaseData(gameCode,"win",0);
    }
    catch(error){
      console.log(error.message);
    }
  };
  const handleUpdatePlay1NumField = async (num) => {
    try{
      setFirebaseData(gameCode,"play1Num",num);
    }
    catch(error){
      console.log(error.message);
    }
  };
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "Bingo", gameCode), (doc) => {
      if (doc.exists()) {
        const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        console.log(source, " data: ", doc.data());
        setWin(doc.data().win);
      } else {
        console.log("Document does not exist.");
        setPlayer(null);
      }
    });

    // Cleanup subscription when component unmounts
    return () => unsub();
  }, []);

  const handleClick = (index) => {
    handleUpdatePlay1NumField(arr[index]);
    setStrickoutCells((prevCells) => {
      const newCells = [...prevCells];
      newCells[index] = true;
      return newCells;
    });

    if (matchWin()) {
      
      // document
      //   .querySelectorAll(".letters-bingo")
      //   [winningIterator].classList.add(style.showBingo);
       
      document.querySelectorAll(`.${style.lettersBingo}`)
    [winningIterator].classList.add(style.showBingo);

        setWinningIterator(winningIterator + 1);

      if (winningIterator === 4) {
        handleUpdateWinField();
        // alert('B I N G O');
        // window.location.reload();
      }
    }
    handleUpdateTurnField();
  };
  useEffect(()=>{
    
    if(win==2){
      alert("you Win");
      handleResetWinField();
    }
    else if(win==1){
      alert("you Lost");
    
    }
    //window.location.reload();

  },[win]);
  useEffect(() => {
    console.log(arr);
  }, [arr]);
  const handleCheck=()=>{
    document.querySelectorAll(`.${style.lettersBingo}`)
    [winningIterator].classList.add(style.showBingo);

        setWinningIterator(winningIterator + 1);
  }

  return (
    <div className="nm">
      <Header/>
      <Container fluid>
        
        <Row>
          <Col>
            <div className={style.bx1} disabled={2 != player}>
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
                            <div className={style.cellformat}>{arr[cellIndex]}</div>
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
          <button onClick={handleCheck}>check</button>
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
                  <h3>{2 == player ? "Your Turn" : "Second Player Turn"}</h3>
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

    // <div className="bg" disabled= {1!=player}>
    //  <Container className='box' fluid="md">
    //  <Row className="justify-content-md-center"><Col><div className='hd'></div></Col></Row>
    //   <Row  className="justify-content-md-center">
    //     <Col sm={8}> <table id="tblBingo">
    //       <tbody>
    //         {Array.from({ length: Math.ceil(arr.length / 5) }, (_, i) => (
    //           <tr key={i}>
    //             {Array.from({ length: 5 }, (_, j) => {
    //               const cellIndex = i * 5 + j;
    //               return (
    //                 <td
    //                   key={cellIndex}
    //                   id={arr[cellIndex].toString()}
    //                   style={{ height: '20%', width: '20%' }}
    //                   className={`main-table-cell ${strickoutCells[cellIndex] ? 'strickout' : ''}`}
    //                   onClick={() => handleClick(cellIndex)}
    //                 >
    //                   <div className="cell-format">{arr[cellIndex]}</div>
    //                 </td>
    //               );
    //             })}
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table></Col>
    //     <Col sm={4}><Row><div className="container">
    //   <h1>{(1==player)?"Your Turn": "Second Player Turn"}</h1>

    //   </div></Row> <Row>  <div className="letter-div"><Col>
    //     <table id="tblLetter">
    //       <tbody>
    //         <tr>
    //           <td className="letters-bingo">B</td>
    //           <td className="letters-bingo">I</td>
    //           <td className="letters-bingo">N</td>
    //           <td className="letters-bingo">G</td>
    //           <td className="letters-bingo">O</td>
    //         </tr>
    //       </tbody>
    //     </table>

    //   </div></Col></Row></Col>
    //   </Row>
    // </Container>

    // </div>
    // 
  );
};

export default BingoBoard2;
