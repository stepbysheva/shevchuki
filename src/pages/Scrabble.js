import React, { useContext, useEffect, useState } from 'react';
import './Scrabble.css';
import { io } from 'socket.io-client';
import { AuthContext } from '../components/AuthContext';
import CustomSnackbarContent from "../components/snackbar";
import { enqueueSnackbar } from "notistack";

const boardSize = 20;

// Different tile types and their positions on the board (you can add more)
const tileTypes = {
  TW: 'Triple Word',
  DW: 'Double Word',
  TL: 'Triple Letter',
  DL: 'Double Letter',
};

const specialTiles = {
  TW: [
    [0, 0], [0, 5], [0, 10], [0, 15],
    [5, 0], [5, 15],
    [10, 0], [10, 15],
    [15, 0], [15, 5], [15, 10], [15, 15],
    [5, 5], [5, 10], [10, 5], [10, 10],
  ],
  DW: [
    [1, 1], [2, 2], [3, 3], [4, 4],
    [16, 16], [17, 17], [18, 18], [19, 19],
    [1, 18], [2, 17], [3, 16], [4, 15],
    [19, 1], [18, 2], [17, 3], [16, 4],
  ],
  TL: [
    [1, 5], [1, 15], [5, 1], [5, 19],
    [5, 9], [9, 5], [9, 15],
    [15, 1], [15, 19],
    [15, 9], [19, 5], [19, 15],
  ],
  DL: [
    [3, 0], [3, 8], [3, 11], [3, 19],
    [8, 3], [8, 8], [8, 11], [8, 16],
    [11, 3], [11, 8], [11, 11], [11, 16],
    [16, 0], [16, 8], [16, 11], [16, 19],
  ],
};

// Function to check if a cell is special and return its type
const getSpecialTile = (row, col) => {
  for (const [type, positions] of Object.entries(specialTiles)) {
    if (positions.some(([r, c]) => r === row && c === col)) {
      return type;
    }
  }
  return null;
};

const socket = io('http://127.0.0.1:5000');

// Scoreboard component to display the players' scores
const Scoreboard = ({ players }) => {
  return (
    <div className="scoreboard">
      {players.map((player) => (
        <div key={player.uid} className="score-entry">
          <span>{player.name}</span>: <span>{player.score}</span>
        </div>
      ))}
    </div>
  );
};

// The ScrabbleBoard component
const ScrabbleBoard = () => {
  const [boardState, setBoardState] = useState(
    Array(boardSize).fill(null).map(() => Array(boardSize).fill(null))
  );
  const { currentUser } = useContext(AuthContext);

  const [selectedLanguage, setSelectedLanguage] = useState('english');

  const [placedLetters, setPlacedLetters] = useState([]); // List to store letter placements
  const [availableLetters, setAvailableLetters] = useState([]); // Letters available for dragging
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [turn, setTurn] = useState(''); // Track the currently selected letter
  console.log(currentUser)
  // Initialize scores for multiple players
  const [score, setScore] = useState([])

  useEffect(() => {
    // Listen for new game event to receive letters and players
    socket.on("receive_letters", (data) => {
      for (const user of data['players']) {
        if (user.uid === currentUser.uid) {
          // Map letters to include unique indices
          const lettersWithIds = user.letters.map((letter, index) => ({ letter, id: index }));
          setAvailableLetters(lettersWithIds);
        }
      }
    });

    socket.on('change_turn', (data) => {
      setTurn(data.turn);
    });

    socket.on('placed_letter', (data) => {
      setBoardState(data.board);
    });

    socket.on('cancel_move', (data) => {
      setBoardState(data.board);
    });

    socket.on('update_score', (data) => {
      setScore(data);
      console.log(data)
    });

    return () => {
      socket.off('player_connected');
      socket.off('update_turn');
      socket.off('message_received');
      socket.off('receive_letters');
    };
  }, []);

  // Handle letter click - set the selected letter (with its unique id)
  const handleLetterClick = (letterObj) => {
    if (turn === currentUser.uid) {
      setSelectedLetter(letterObj); // Set the entire letter object { letter, id }
    }
  };

  const startGame = () => {
    socket.emit('new_game', { language: selectedLanguage });
  };

  const checkWord = async () => {
    if (placedLetters.length !== 0) {
      const response = await fetch('http://localhost:5000/validate_board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placedLetters: placedLetters,
          board: boardState,
        }),
      });
      const data = await response.json();
      if (data.message !== false) {
        // Update the current player's score in the player list
        socket.emit('update_score', {uid: currentUser.uid, score: data.message});
        setPlacedLetters([]);
        const message1 = `${data.message} points added to you`;
        enqueueSnackbar(message1, {
          content: (key) => (
            <CustomSnackbarContent
              message={message1}
            />
          ),
        });
      } else {
        enqueueSnackbar('Word does not exist', {
          content: (key) => (
            <CustomSnackbarContent
              message='Word does not exist'
            />
          ),
        });
        handleCancel()
      }
    }
  };

  const endTurn = async () => {
    const amount = 7 - availableLetters.length;
    const response = await fetch('http://localhost:5000/get_letters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        needed: amount, // Specify the number of letters you need
      }),
    });

    const data = await response.json();
    console.log(data.letters);
    const newLettersWithIds = data.letters.map((letter, index) => ({ letter, id: availableLetters.length + index }));
    setAvailableLetters([...availableLetters, ...newLettersWithIds]);
    socket.emit('end_turn');
    setPlacedLetters([]);
  };

  // Handle board cell click - place the selected letter
  const handleBoardClick = (row, col) => {
    if (selectedLetter) {
      // Check if the cell is already occupied
      if (boardState[row][col]) {
        return; // If cell is occupied, do nothing
      }

      // Update board state with the new letter
      const newBoardState = boardState.map((boardRow, r) =>
        boardRow.map((cell, c) => (r === row && c === col ? selectedLetter.letter : cell))
      );
      setBoardState(newBoardState);
      socket.emit('place_letter', { board: newBoardState });

      // Update placed letters with its indexes (row, col)
      setPlacedLetters([...placedLetters, { letter: selectedLetter.letter, row, col }]);

      // Remove only the selected letter by its unique id
      setAvailableLetters(availableLetters.filter((l) => l.id !== selectedLetter.id));

      // Clear the selected letter
      setSelectedLetter(null);
    }
  };

  // Handle cancel button click - reset the board and return letters to the row
  const handleCancel = () => {
    const newBoard = boardState.map((row) => [...row]);

    // Iterate over the placed letters and remove them from the board
    placedLetters.forEach(({ row, col }) => {
      newBoard[row][col] = null; // Set the letter position back to null
    });

    socket.emit('cancel_move', { board: newBoard });

    // Restore letters to availableLetters
    const newAvailableLetters = [...availableLetters, ...placedLetters.map((p) => ({ letter: p.letter, id: availableLetters.length + Math.random() }))];
    setAvailableLetters([...new Set(newAvailableLetters)]); // Ensure no duplicates

    // Clear the board state
    setPlacedLetters([]);
    setSelectedLetter(null);
  };

  return (
    <div style={{ justifyContent: 'center', alignContent: 'center' }}>
      {/* Scoreboard above the board */}
      <Scoreboard players={score} />

      <div className="scrabble-board">
        {Array(boardSize).fill(null).map((_, row) => (
          <div key={row} className="row">
            {Array(boardSize).fill(null).map((_, col) => {
              const tileType = getSpecialTile(row, col);
              const cellValue = boardState[row][col]; // Get letter from boardState
              return (
                <div
                  key={col}
                  className={`tile ${tileType ? tileType : ''}`}
                  onClick={() => handleBoardClick(row, col)}
                >
                  <div className="cell">{cellValue}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Row of letter tiles below the board */}
      <div className="letter-row-wrapper">
        <div className="letter-row">
          {availableLetters.map((letterObj) => (
            <div
              key={letterObj.id} // Use unique ID for each letter
              className={`letter-tile ${selectedLetter?.id === letterObj.id ? 'selected' : ''}`}
              onClick={() => handleLetterClick(letterObj)} // Pass the letter object (with id)
            >
              {letterObj.letter}
            </div>
          ))}
        </div>
        <div className="button-row">
          {currentUser.uid === turn ? (
            <div className="cancel-button">
              <button onClick={handleCancel}>Cancel</button>
            </div>
          ) : null}

          {currentUser.uid === turn ? (
            <div className="cancel-button">
              <button onClick={checkWord}>Check Word</button>
            </div>
          ) : null}
          {currentUser.uid === 'CqgxpmYXsDOxRxptkRiehZ79oWR2' ? (
              <div className='start-game-ch'>
                  <div className="cancel-button" style={{display: 'inline-block'}}>
                    <button style={{heigh: 'inline-block'}} onClick={startGame}>Start</button>
                  </div>
                  <select
                      className='select-lang'
                      style={{border: '', display: 'inline-block'}}
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    <option value="english">En</option>
                    <option value="russian">Ru</option>
                  </select>
              </div>
          ) : null}
          {currentUser.uid === turn ? (
            <div className="cancel-button">
              <button onClick={endTurn}>End Turn</button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ScrabbleBoard;