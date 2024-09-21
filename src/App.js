
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import "./App.css";
import HomePage from './pages/home/home_page';
import BingoBoard1 from './pages/bingo/bingo_player1_page';
import BingoBoard2 from './pages/bingo/bingo.player2_page.js';
import JoinBingoPage from './pages/join_room/join_room_page.js';
import CreateBingoPage from './pages/create_room/create_room_page.js';
function App() {
  return (
    <Router> 
    
    <div className="App"> 
      
    <Routes> 
        <Route exact path='/' element={<HomePage/>}></Route> 
        <Route exact path='/join-bingo' element={<JoinBingoPage/>}></Route> 
        <Route exact path='/create-bingo' element={<CreateBingoPage/>}></Route> 
       
        <Route exact path='/bingo/player1/:gameCode' element={<BingoBoard1/>}></Route> 
        <Route exact path='/bingo/player2/:gameCode' element={<BingoBoard2/>}></Route> 

  
       
    </Routes> 
    </div> 
  </Router> 
  );
}

export default App;
