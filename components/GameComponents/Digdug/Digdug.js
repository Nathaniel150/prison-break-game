import React, { PureComponent, useState, useRef } from "react";
import {
  StyleSheet,
  StatusBar,
  Pressable,
  Text,
  View,
  Button,
} from "react-native";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogActions,
  Provider,
} from "@react-native-material/core";
import { GameEngine } from "react-native-game-engine";
import { MoveAvatar } from "./systems";
import { DirtArray } from "./entities";
import Controller from "./Controller";
import Constants from "../../Constants";

export default function Digdug({ updateState }) {
  const [running, setRunning] = useState(true);
  const [hasWon, setHasWon] = useState(false);
  const [gotCaught, setGotCaught] = useState(false);
  const [spoonCount, setSpoonCount] = useState(10);

  const engine = useRef(null);

  const [entities, setEntities] = useState({
    dirtArray: {
      playerPosition: [1, 1],
      guardPositions: [
        {
          xPos: 3,
          yPos: 6,
          stunned: false,
          stunnedTimer: 0,
        },
        {
          xPos: 5,
          yPos: 0,
          stunned: false,
          stunnedTimer: 0,
        },
        // [3, 6],
        // [5, 0],
        // [9, 3],
      ],
      renderer: <DirtArray />,
    },
  });

  //these can be the same function I think decrementSpoonCount
  const handleThrowSpoon = () => {
    if (spoonCount <= 0) {
      setRunning(false);
    }
    setSpoonCount(spoonCount - 1);
  };

  const handleBreakRock = () => {
    if (spoonCount <= 0) {
      setRunning(false);
    }
    setSpoonCount(spoonCount - 1);
  };

  return (
    <>
      <GameEngine
        ref={engine}
        style={styles.container}
        running={running}
        systems={[MoveAvatar]}
        entities={entities}
        onEvent={(e) => {
          if (e === "winner") {
            setRunning(false);
            setHasWon(true);
          } else if (e == "caught") {
            setRunning(false);
            setGotCaught(true);
          }
        }}
      >
        <StatusBar hidden={true} />
      </GameEngine>

      <Provider>
        <Dialog visible={hasWon}>
          <DialogContent>
            <Text>Congrats You Escaped!</Text>
          </DialogContent>
          <DialogActions>
            {/* TODO Once I have the new updateState function, this button will return the player to the levels page */}
            <Button
              title="Escape"
              compact
              variant="text"
              onPress={() => updateState(Constants.STORY_P4)}
            />
          </DialogActions>
        </Dialog>
      </Provider>
      <Provider>
        <Dialog visible={gotCaught}>
          <DialogContent>
            <Text>The Guards Have Defeated you!</Text>
          </DialogContent>
          <DialogActions>
            {/* TODO Once I have the new updateState function, this button will return the player to the levels page */}
            <Button
              title="Continue"
              compact
              variant="text"
              onPress={() => updateState(Constants.STORY_P3)}
            />
          </DialogActions>
        </Dialog>
      </Provider>
      <View>
        <Text>Spoon Count: {spoonCount}</Text>
      </View>

      <View style={styles.controller}>
        <Controller
          engine={engine}
          type="throw-spoon"
          handleThrowSpoon={handleThrowSpoon}
          spoonCount={spoonCount}
        />
        <Controller
          engine={engine}
          type="break-rock"
          handleBreakRock={handleBreakRock}
          spoonCount={spoonCount}
        />
      </View>
      <Controller engine={engine} type="move" spoonCount={spoonCount} />

      <View style={styles.spacer}></View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  controller: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
  },
  text: {
    textAlign: "center",
  },
  spacer: {
    marginTop: 30,
  },
  winModal: {
    zIndex: 10,
    position: "absolute",
    top: "20%",
    left: "26%",
    backgroundColor: "lightblue",
    padding: 20,
  },
});

// Todo I need to check for out of bounds in the array, to avoid crashing.
//   right now I just have rocks on all the edges, so it's impossible to go out of bounds.

// Ideas: maybe you have ten spoons and can throw your spoon to stun guard,
//  or use 1 to break a rock. If you get to 0 spoons, you can't dig anymore.
