import { useState, useEffect } from "react";
import { View, Text, Pressable, SafeAreaView, Button } from "react-native";
import Constants from "../../Constants";
import BattleshipSquare from "./BattleshipSquare";
import Draggable from "react-native-draggable";
import Ship from "./Ship";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogActions,
  Provider,
} from "@react-native-material/core";

export default function BattleShipBoard({ updateState }) {
  //TODO I think this should have a dependence on shipInfoTracker, but it wasn't working for some reason.
  useEffect(() => {
    if (checkFinishedSetup()) {
      setReady(true);
    }
  });

  //Build the board that is basically empty.
  const createBoard = () => {
    //this stores information about how the game state of each square
    // as well as the loacation that each square is rendered at.
    // The location information will be set as each square is rendered in BattleshipSquare.
    let defaultSquare = {
      isShip: false,
      isHit: false,
      shipId: null, //when each ship is placed, it is given an id, so we can figure out when it is sunk
      isSunk: false,
    };

    let board = [];
    for (let i = 0; i < Constants.BATTLESHIP_BOARD_DIMENSIONS; i++) {
      let row = [];

      for (let j = 0; j < Constants.BATTLESHIP_BOARD_DIMENSIONS; j++) {
        row.push({ ...defaultSquare });
      }
      board.push(row);
    }
    return board;
  };

  const initShips = () => {
    let ships = [];
    for (let i = 0; i < Constants.NUM_BATTLESHIPS; i++) {
      let defaultShip = {
        selected: false, //used in setup to know which ship to place
        placed: false, // used in setup to show whether the ship has been placed.
        orientation: "vertical", // which way the ship is facing.
        size: Constants.BATTLESHIP_SIZES[i],
      };
      ships.push({ ...defaultShip });
    }
    return ships;
  };

  //once the enemy board has been initialized, randomly place the
  // ships on it.
  useEffect(() => {
    if (enemyBoard && isSetup) {
      for (let i = 0; i < Constants.NUM_BATTLESHIPS; i++) {
        //place the battle ship at random location
        let col = Math.floor(
          Math.random() * Constants.BATTLESHIP_BOARD_DIMENSIONS
        );
        let row = Math.floor(
          Math.random() * Constants.BATTLESHIP_BOARD_DIMENSIONS
        );

        let orientations = ["vertical", "horizontal"];
        let index = Math.floor(Math.random() * 2);
        while (
          !canPlaceEnemyShip(
            col,
            row,
            orientations[index],
            Constants.BATTLESHIP_SIZES[i]
          )
        ) {
          col = Math.floor(
            Math.random() * Constants.BATTLESHIP_BOARD_DIMENSIONS
          );
          row = Math.floor(
            Math.random() * Constants.BATTLESHIP_BOARD_DIMENSIONS
          );
          index = Math.floor(Math.random() * 2);
        }
        placeEnemyShip(
          col,
          row,
          orientations[index],
          Constants.BATTLESHIP_SIZES[i],
          i // use i as the shipId
        );
      }
    }
  }, [enemyBoard]);

  useEffect(() => {
    setWon(hasWon);
    setLost(hasLost);
  });

  //returns true when all the enemy ships have been sunk.
  const hasWon = () => {
    for (let i = 0; i < Constants.BATTLESHIP_BOARD_DIMENSIONS; i++) {
      for (let j = 0; j < Constants.BATTLESHIP_BOARD_DIMENSIONS; j++) {
        //make sure every square that is a ship is also sunk.
        if (enemyBoard[i][j].isShip && !enemyBoard[i][j].isSunk) {
          return false;
        }
      }
    }
    console.log("YOU WON!");
    return true;
  };

  //return true if all the player's ships have bee sunk.
  const hasLost = () => {
    for (let i = 0; i < Constants.BATTLESHIP_BOARD_DIMENSIONS; i++) {
      for (let j = 0; j < Constants.BATTLESHIP_BOARD_DIMENSIONS; j++) {
        if (board[i][j].isShip && !board[i][j].isSunk) {
          return false;
        }
      }
    }
    return true;
  };

  //check that it is allowed to place the ship at the location i,j
  const canPlaceEnemyShip = (i, j, orientation, size) => {
    if (orientation == "vertical") {
      if (j + size > Constants.BATTLESHIP_BOARD_DIMENSIONS) {
        return false;
      }

      for (let k = 0; k < size; k++) {
        if (enemyBoard[i][j + k].isShip) {
          return false;
        }
      }
    }

    if (orientation == "horizontal") {
      if (i + size > Constants.BATTLESHIP_BOARD_DIMENSIONS) {
        return false;
      }

      for (let k = 0; k < size; k++) {
        if (enemyBoard[i + k][j].isShip) {
          return false;
        }
      }
    }

    return true;
  };

  //place the ship based on its orientation.
  const placeEnemyShip = (col, row, orientation, size, id) => {
    let newBoard = [...enemyBoard];

    if (orientation == "vertical") {
      for (let k = 0; k < size; k++) {
        newBoard[col][row + k].isShip = true;
        newBoard[col][row + k].shipId = id;
      }
    } else if (orientation == "horizontal") {
      for (let k = 0; k < size; k++) {
        newBoard[col + k][row].isShip = true;
        newBoard[col + k][row].shipId = id;
      }
    }
    setEnemyBoard(newBoard);
  };

  const checkFinishedSetup = () => {
    return shipInfoTracker.every((ship) => {
      return ship.placed;
    });
  };

  const startGame = () => {
    setIsSetup(false);
    setReady(false); //To hide the popup menu
  };

  const selectShip = (i) => {
    let infoTrackerCopy = [...shipInfoTracker];

    for (let k = 0; k < infoTrackerCopy.length; k++) {
      //set the correct ship to selected.
      if (k == i) {
        infoTrackerCopy[k].selected = true;
        changeOrientation(i);
      }
      //unselect all the other ships.
      else {
        infoTrackerCopy[k].selected = false;
      }
    }

    setShipInfoTracker(infoTrackerCopy);
  };

  const changeOrientation = (i) => {
    let infoTrackerCopy = [...shipInfoTracker];

    for (let k = 0; k < infoTrackerCopy.length; k++) {
      //change the orentation of the selcted ship.
      if (shipInfoTracker[k].selected) {
        if (shipInfoTracker[k].orientation == "horizontal") {
          shipInfoTracker[k].orientation = "vertical";
        } else {
          shipInfoTracker[k].orientation = "horizontal";
        }
        break;
      }
    }
    setShipInfoTracker(infoTrackerCopy);
  };

  const canPlaceShip = (i, j, orientation, size) => {
    if (orientation == "vertical") {
      if (j + size > Constants.BATTLESHIP_BOARD_DIMENSIONS) {
        return false;
      }

      for (let k = 0; k < size; k++) {
        if (board[i][j + k].isShip) {
          return false;
        }
      }
    }

    if (orientation == "horizontal") {
      if (i + size > Constants.BATTLESHIP_BOARD_DIMENSIONS) {
        return false;
      }

      for (let k = 0; k < size; k++) {
        if (board[i + k][j].isShip) {
          return false;
        }
      }
    }

    return true;
  };

  //places a ship on the board. The i and j are the indices where the ship should start.
  const placeShip = (i, j) => {
    let shipIndex = shipInfoTracker.findIndex((ship) => ship.selected == true);
    let ship = shipInfoTracker[shipIndex];

    //disable placement if no ship is selected.
    if (ship == undefined) {
      return;
    }

    //check if the ship can be placed in this location.
    let newBoard = [...board];

    //will stop the player from placing a ship in an illegal spot.
    if (!canPlaceShip(i, j, ship.orientation, ship.size)) {
      return;
    }

    if (ship.orientation == "vertical") {
      for (let k = 0; k < ship.size; k++) {
        newBoard[i][j + k].isShip = true;
        newBoard[i][j + k].shipId = shipIndex;
      }
    } else if (ship.orientation == "horizontal") {
      for (let k = 0; k < ship.size; k++) {
        newBoard[i + k][j].isShip = true;
        newBoard[i + k][j].shipId = shipIndex;
      }
    }
    ship.selected = false;
    ship.placed = true;

    let infoTrackerCopy = [...shipInfoTracker];
    infoTrackerCopy[shipIndex] = ship;
    setShipInfoTracker(infoTrackerCopy);
    setBoard(newBoard);
  };

  const resetBoard = () => {
    setReady(false);
    setBoard(createBoard);
    setShipInfoTracker(initShips);
    setIsSetup(true);
    setWon(false);
    setLost(false);
  };

  const takeEnemyTurn = () => {
    let newBoard = [...board];

    let col = Math.floor(Math.random() * Constants.BATTLESHIP_BOARD_DIMENSIONS);
    let row = Math.floor(Math.random() * Constants.BATTLESHIP_BOARD_DIMENSIONS);

    //make sure the computer doesn't go after a square that it already chose.
    while (newBoard[col][row].isHit) {
      col = Math.floor(Math.random() * Constants.BATTLESHIP_BOARD_DIMENSIONS);
      row = Math.floor(Math.random() * Constants.BATTLESHIP_BOARD_DIMENSIONS);
    }

    newBoard[col][row].isHit = true;
    if (newBoard[col][row].isShip) {
      console.log("Checking sunk on enemy turn");
      checkIfSunk(newBoard[col][row].shipId, newBoard, false);
    }
    setBoard(newBoard);
  };

  const checkIfSunk = (id, boardToUse, enemyBoard) => {
    console.log("Checking sunk", id);
    for (let i = 0; i < Constants.BATTLESHIP_BOARD_DIMENSIONS; i++) {
      for (let j = 0; j < Constants.BATTLESHIP_BOARD_DIMENSIONS; j++) {
        if (boardToUse[i][j].shipId == id && !boardToUse[i][j].isHit) {
          console.log("Not Sunk", i, j);
          return;
        }
      }
    }
    let newBoard = [...boardToUse];
    for (let i = 0; i < Constants.BATTLESHIP_BOARD_DIMENSIONS; i++) {
      for (let j = 0; j < Constants.BATTLESHIP_BOARD_DIMENSIONS; j++) {
        if (newBoard[i][j].shipId == id) {
          newBoard[i][j].isSunk = true;
        }
      }
    }
    if (enemyBoard) {
      setEnemyBoard(newBoard);
    } else {
      setBoard(newBoard);
    }
  };

  //an array of booleans that tracks which ships have been hit.
  const [board, setBoard] = useState(() => createBoard());

  const [enemyBoard, setEnemyBoard] = useState(() => createBoard());

  //To keep track of which ships (draggable elements) have been placed, so I can remove them from the screen when they have been placed.
  const [shipInfoTracker, setShipInfoTracker] = useState(() => initShips());
  //keeping track of if the player is still setting up their board or if they are playing the game.
  const [isSetup, setIsSetup] = useState(true);

  const [ready, setReady] = useState(false);
  //keep track of when the player wins
  const [won, setWon] = useState(false);
  //keep track of when the player loses
  const [lost, setLost] = useState(false);

  //used to try and make
  const [tempI, setTempI] = new useState(0);
  const [tempJ, setTempJ] = new useState(0);

  return (
    <SafeAreaView>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {isSetup ? (
          <></>
        ) : (
          enemyBoard.map((row, i) => {
            return (
              <View key={`row+${i}`}>
                {row.map((square, j) => {
                  return (
                    <BattleshipSquare
                      key={`square+${i}+${j}`}
                      setup={isSetup}
                      placeShip={() => {}}
                      square={square}
                      board={enemyBoard}
                      setBoard={setEnemyBoard}
                      i={i}
                      j={j}
                      enemy={true}
                      takeEnemyTurn={() => takeEnemyTurn()}
                      checkIfSunk={checkIfSunk}
                    />
                  );
                })}
              </View>
            );
          })
        )}
      </View>
      {/* Spacer will eventually have fight animation */}
      <View style={{ height: 50 }}></View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {board.map((row, i) => {
          return (
            <View key={`row+${i}`}>
              {row.map((square, j) => {
                return (
                  <BattleshipSquare
                    key={`square+${i}+${j}`}
                    setup={isSetup}
                    placeShip={() => placeShip(i, j)}
                    square={square}
                    board={board}
                    setBoard={setBoard}
                    i={i}
                    j={j}
                    enemy={false}
                    checkIfSunk={checkIfSunk}
                  />
                );
              })}
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={() => {
          resetBoard();
        }}
        style={{
          top: 700,
          zIndex: 2010,
          backgroundColor: "grey",
          height: "20%",
          width: "30%",
        }}
        color={"red"}
      >
        <Text>Reset</Text>
      </Pressable>

      {/* I want the draggable to dissapear after it is realeased. */}
      {shipInfoTracker.map((ship, i) => {
        if (ship.placed) {
          return;
        }

        return (
          <Ship
            key={`ship${i}`}
            selectShip={() => selectShip(i)}
            changeOrientation={() => changeOrientation(i)}
            battleShipSize={Constants.BATTLESHIP_SIZES[i]}
            ship={ship}
            orientation={ship.orientation}
            x={50 + i * 100}
            y={500}
            i={i}
          />
        );
      })}

      <Provider>
        <Dialog visible={ready}>
          {/* <DialogHeader title={won === true ? "WON" : "LOST"} /> */}
          <DialogContent>
            <Text>Content</Text>
          </DialogContent>
          <DialogActions>
            <Button
              title="Reset"
              compact
              variant="text"
              onPress={() => resetBoard()}
            />
            <Button
              title="Start"
              compact
              variant="text"
              onPress={() => startGame()}
            />
          </DialogActions>
        </Dialog>
      </Provider>
      {/* Popup menu when the player wins */}
      <Provider>
        <Dialog visible={won}>
          <DialogContent>
            <Text>Congrats!</Text>
          </DialogContent>
          <DialogActions>
            <Button
              title="Play Again"
              compact
              variant="text"
              onPress={() => resetBoard()}
            />
            <Button
              title="Escape Cafeteria"
              compact
              variant="text"
              onPress={() => updateState()}
            />
          </DialogActions>
        </Dialog>
      </Provider>
      <Provider>
        <Dialog visible={lost}>
          <DialogContent>
            <Text>Sorry!</Text>
          </DialogContent>
          <DialogActions>
            <Button
              title="Try Again"
              compact
              variant="text"
              onPress={() => resetBoard()}
            />
            <Button
              title="GO HOME (This won't work yet)"
              compact
              variant="text"
              // onPress={() => updateState()}
            />
          </DialogActions>
        </Dialog>
      </Provider>
    </SafeAreaView>
  );
}

//Todo if I place a ship, it should auto select a new one
