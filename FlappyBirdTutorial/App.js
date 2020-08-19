import React, { Component } from 'react';
import { Dimensions, StyleSheet, Text, View, StatusBar, Alert, TouchableOpacity } from 'react-native';
import Matter from "matter-js";
import { GameEngine } from "react-native-game-engine";
import Bird from './Bird';
import Wall from './Wall';
import Physics from './Physics';
import Constants from './Constants';

export const randomBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const generatePipes = () => {
    let topPipeHeight = randomBetween(100, (Constants.MAX_HEIGHT / 2) - 100);
    let bottomPipeHeight = Constants.MAX_HEIGHT - topPipeHeight - Constants.GAP_SIZE;

    let sizes = [topPipeHeight, bottomPipeHeight]

    if (Math.random() < 0.5) {
        sizes = sizes.reverse();
    }


    return sizes;
}


export default class App extends Component {
    constructor(props){
        super(props);

        this.state = {
            running: true
        };

        this.gameEngine = null;

        this.entities = this.setupWorld();
    }

    setupWorld = () => {
        let engine = Matter.Engine.create({ enableSleeping: false });
        let world = engine.world;

        let bird = Matter.Bodies.rectangle( Constants.MAX_WIDTH / 4, Constants.MAX_HEIGHT / 2, 50, 50);
        let floor = Matter.Bodies.rectangle( Constants.MAX_WIDTH / 2, Constants.MAX_HEIGHT - 25, Constants.MAX_WIDTH, 50, { isStatic: true });
        let ceiling = Matter.Bodies.rectangle( Constants.MAX_WIDTH / 2, 25, Constants.MAX_WIDTH, 50, { isStatic: true });

        let [firstPipeTopHeight, firstPipeBotHeight] = generatePipes();
        let pipe_idx1 = Matter.Bodies.rectangle( Constants.MAX_WIDTH - (Constants.PIPE_WIDTH / 2), firstPipeTopHeight / 2, Constants.PIPE_WIDTH, firstPipeTopHeight, { isStatic: true });
        let pipe_idx2 = Matter.Bodies.rectangle( Constants.MAX_WIDTH - (Constants.PIPE_WIDTH / 2), Constants.MAX_HEIGHT - (firstPipeBotHeight / 2), Constants.PIPE_WIDTH, firstPipeBotHeight, { isStatic: true });

        let [secondPipeTopHeight, secondPipeBotHeight] = generatePipes();
        let pipe_idx3 = Matter.Bodies.rectangle( Constants.MAX_WIDTH * 2 - (Constants.PIPE_WIDTH / 2), secondPipeTopHeight / 2, Constants.PIPE_WIDTH, secondPipeTopHeight, { isStatic: true });
        let pipe_idx4 = Matter.Bodies.rectangle( Constants.MAX_WIDTH * 2 - (Constants.PIPE_WIDTH / 2), Constants.MAX_HEIGHT - (secondPipeBotHeight / 2), Constants.PIPE_WIDTH, secondPipeBotHeight, { isStatic: true });

        Matter.World.add(world, [bird, floor, ceiling, pipe_idx1, pipe_idx2, pipe_idx3, pipe_idx4]);

        Matter.Events.on(engine, 'collisionStart', (event) => {
          var pairs = event.pairs;
          this.gameEngine.dispatch({type: "foo-bar"});
        });


        return {
            physics: { engine: engine, world: world },
            bird: { body: bird, size: [50, 50], color: 'red', renderer: Bird},
            floor: { body: floor, size: [Constants.MAX_WIDTH, 50], color: "green", renderer: Wall },
            ceiling: { body: ceiling, size: [Constants.MAX_WIDTH, 50], color: "green", renderer: Wall },
            pipe_idx1: { body: pipe_idx1, size: [Constants.PIPE_WIDTH, firstPipeTopHeight], color: "green", renderer: Wall },
            pipe_idx2: { body: pipe_idx2, size: [Constants.PIPE_WIDTH, firstPipeBotHeight], color: "green", renderer: Wall },
            pipe_idx3: { body: pipe_idx3, size: [Constants.PIPE_WIDTH, secondPipeTopHeight], color: "green", renderer: Wall },
            pipe_idx4: { body: pipe_idx4, size: [Constants.PIPE_WIDTH, secondPipeBotHeight], color: "green", renderer: Wall }
        }
    }

    onEvent = (e) => {
        if (e.type === "foo-bar"){
            //Alert.alert("Game Over");
            this.setState({
                running: false
            });
        }
    }

    reset = () => {
        this.gameEngine.swap(this.setupWorld());
        this.setState({
            running: true
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <GameEngine
                    ref={(ref) => { this.gameEngine = ref; }}
                    style={styles.gameContainer}
                    systems={[Physics]}
                    running={this.state.running}
                    onEvent={this.onEvent}
                    entities={this.entities}>
                    <StatusBar hidden={true} />
                </GameEngine>
                {!this.state.running && <TouchableOpacity style={styles.fullScreenButton} onPress={this.reset}>
                    <View style={styles.fullScreen}>
                        <Text style={styles.gameOverText}>Game Over</Text>
                    </View>
                </TouchableOpacity>}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    gameContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    gameOverText: {
        color: 'white',
        fontSize: 48
    },
    fullScreen: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'black',
        opacity: 0.8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    fullScreenButton: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        flex: 1
    }
});
