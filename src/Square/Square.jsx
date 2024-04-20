import React, { useState } from 'react'
import "./Square.css"
import { IoClose } from "react-icons/io5";
import { RiCircleLine } from "react-icons/ri";




function Square({ 
  finishedState, 
  currentElement,
  setGameState, 
  gameState,
  role,
  id, 
  socket,
  currentPlayer, 
  finishedArrayState,
  setCurrentPlayer }) {
  const [icon, setIcon] = useState(null)


  const clickOnSquare = () => {

    if(role !== currentPlayer) return
    if(finishedState) return

    if (!icon) {
      if(currentPlayer === "circle"){
        setIcon(<RiCircleLine />)
      }else{
        setIcon(<IoClose size={"1.1em"}/>)
      }

      const myCurrentPlayer = currentPlayer
      console.log(currentPlayer);
      console.log(role);
      socket.emit("playerMoveFromClient",{
        state: {
          id,
          sign: myCurrentPlayer
      }
      })
      
      
      setCurrentPlayer(currentPlayer === "circle" ? "cross" : "circle")
      setGameState(prev => {
        let newState = [...prev];
        const rowIndex = Math.floor(id/3)
        const colIndex = id % 3
        newState[rowIndex][colIndex] = myCurrentPlayer
        return newState
      })
    }
  }

  return (
   <>
    <div onClick={clickOnSquare} className={`square 
    ${finishedState ? 'not-allow' : ''} 
    ${currentPlayer !== role ? "not-allow" : ""} 
    ${finishedState && finishedState !== role ? "grey-background" : ""} 
    ${finishedArrayState.includes(id) ? finishedState + '-won' : ''}
    `}>
      {currentElement === "circle" ? <RiCircleLine /> : currentElement === "cross" ? <IoClose size={"1.1em"}/> : icon}
      </div>
      </>
  )
}

export default Square