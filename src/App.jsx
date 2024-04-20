import React, { useEffect, useState } from 'react'
import "./App.css"
import Square from './Square/Square'
import { io } from "socket.io-client"
import Swal from "sweetalert2"
import { RiClosedCaptioningLine } from 'react-icons/ri'



const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]

function App() {
  const [gameState, setGameState] = useState(matrix)
  const [currentPlayer, setCurrentPlayer] = useState('circle')
  const [finishedState, setFinishedState] = useState(false)
  const [finishedArrayState, setFinishedArrayState] = useState([])
  const [playOnline, setPlayOnline] = useState(false)
  const [socket, setSocket] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [opponentName, setOpponentName] = useState(null)
  const [role, setRole] = useState(null)



  useEffect(() => {
    document.title = "Tic Tac Toe"
  }, []);








  const checkWinner = () => {
    for (let i = 0;i < 3; i++) {
      // Check row
      if (gameState[i][0] === gameState[i][1] &&
        gameState[i][1] === gameState[i][2]) {
        setFinishedArrayState([i * 3 + 0,i * 3 + 1, i * 3 + 2])
        return gameState[i][0]
      }
      // Check col
      if (gameState[0][i] === gameState[1][i] &&
        gameState[1][i] === gameState[2][i]) {
          setFinishedArrayState([0 * 3 + i,1 * 3 + i, 2 * 3 + i])
          return gameState[0][i]
        }
      // Check diagonal line
      if (gameState[0][0] === gameState[1][1] &&
        gameState[1][1] === gameState[2][2]) {
          setFinishedArrayState([0,4,8])
          return gameState[0][0]
        }
      if (gameState[0][2] === gameState[1][1] &&
        gameState[1][1] === gameState[2][0]) {
          setFinishedArrayState([2,4,6])
          return gameState[0][2]
        }

    }

    const isDrawMatch = gameState.flat().every((e) => {
      if (e === "circle" || e === "cross") return true
    })

    if (isDrawMatch) return 'draw'
    return null
  }



  useEffect(() => {
    const winner = checkWinner()
    if (winner) {
      setFinishedState(winner)
    }

    
  }, [gameState])



  if(playOnline && !opponentName){
    return (<>
    <div className='container waiting'><h2 className='wating-animation'>Waiting for opponent</h2></div>
    </>)
  }

  const getPlayerName = async() => {
    return await Swal.fire({
    title: "Enter your name",
    input: "text",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "Please enter your name!";
      }
      if(value.length > 10) return "Your name must >= 10"
    }
  });
}


  socket?.on("playerMoveFromServer",(data) => {
    console.log(data.state);
    const id = data.state.id
    setGameState(prev => {
      let newState = [...prev];
      const rowIndex = Math.floor(id/3)
      const colIndex = id % 3
      newState[rowIndex][colIndex] = data.state.sign
      return newState
    })
    setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle")
  })
  socket?.on("connect", () => {
    setPlayOnline(true)
  })

  socket?.on("OpponentNotFound", () => {
    setOpponentName(false)
  })
  socket?.on("OpponentFound", (data) => {
    console.log(data);
    setRole(data.role)
    setOpponentName(data.opponentName)
  })


  const playOnlineHandle = async() => {
    const result = await getPlayerName()
    if(!result.isConfirmed) return

    setPlayerName(result.value)

    const newSocket = io("http://localhost:3000",{
      autoConnect: true,
    })
    newSocket?.emit("request_to_play", {
      playerName: result.value
    })

    setSocket(newSocket)
  }

  if(!playOnline){
    return <div className='container'>
              <button onClick={playOnlineHandle} className='playBtn'>Play</button>
           </div>
  }

  return (
    <div className='container'>
      <div className='name'>
        <div className={`name_left ${currentPlayer === role ? "current-"+currentPlayer : ""}`}>{playerName}</div>
        <div className={`name_right ${currentPlayer !== role ? "current-"+currentPlayer : ""}`}>{opponentName}</div>
      </div>
      <h1 className="title border-radius-5px">Tic Tac Toe</h1>
      <div className="square-container">
        {
          gameState.map((arr, rowIndex) => {
            return arr.map((e, colIndex) => {
              return <Square 
              socket={socket}
              role={role}
              gameState={gameState}
              finishedArrayState={finishedArrayState} 
              finishedState={finishedState} 
              setFinishedState={setFinishedState} 
              currentPlayer={currentPlayer} 
              setCurrentPlayer={setCurrentPlayer} 
              setGameState={setGameState} 
              currentElement={e}
              id={rowIndex * 3 + colIndex} 
              key={rowIndex * 3 + colIndex} />
            })
          })
        }
      </div>
      {finishedState && finishedState !== "draw" &&
        (<h3 className='finished-state'>{finishedState} won the game!</h3>)}
      {finishedState && finishedState === "draw" &&
        (<h3 className='finished-state'>It's a Draw</h3>)}
      {!finishedState && opponentName &&
        (<h3>You are playing with {opponentName}</h3>)}
    </div>
  )
}

export default App