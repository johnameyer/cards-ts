import { GameDriver, IncrementalIntermediary, InquirerPresenter } from "@cards-ts/core";
import { argv } from "yargs";
import { IntermediaryHandler, defaultParams } from ".";
import { GameState } from "./game-state";
import { GameStateIterator } from "./game-state-iterator";
import { HeuristicHandler } from "./handlers/heuristic-handler";
import { ResponseMessage } from "./messages/response-message";
import { ResponseValidator } from "./response-validator";
import { StateTransformer } from "./state-transformer";

// DEMO event-based server flow

// Set-up
const mainPlayer = new IntermediaryHandler(new IncrementalIntermediary(new InquirerPresenter()));
let names: string[] = [];
let name: string = argv.name as string;
if(!argv.name) {        
    // await mainPlayer.askForName();
    name = 'Jerome';
}
names.push(name);
names.push('Greg', 'Hugh', 'Leah');

const players = Array(4);
players[0] = mainPlayer;
for(let i = 1; i < players.length; i++) {
    players[i] = new HeuristicHandler();
}

const stateTransformer = new StateTransformer();
const responseValidator = new ResponseValidator();
const gameStateIterator = new GameStateIterator();

const database = new class {
    private state: GameState | undefined;
    get() {
        if(!this.state) {
            this.state = stateTransformer.initialState({ names: names, gameParams: defaultParams });
        }
        return this.state;
    }

    set(state: GameState) {
        this.state = state;
    }
}();

function handleEvent(sourceHandler: number, incomingEvent: ResponseMessage) {
    // Load the old state
    const currentState = database.get();
    
    // Check the event
    const validatedEvent = responseValidator.validate(currentState, sourceHandler, incomingEvent);
    
    if(!validatedEvent) {
        console.error('Received invalid event: ' + JSON.stringify(incomingEvent));
        return false;
    }
    
    // Merge the data from the event
    const [shouldContinue, updatedState] = stateTransformer.merge(currentState, sourceHandler, validatedEvent);

    //preserve state
    database.set(updatedState);

    return shouldContinue;
}

(async function() {
    while(!database.get().completed) {

        // Create the driver
        const driver = new GameDriver(players, database.get(), gameStateIterator, stateTransformer, responseValidator);
        
        // Play through all of synchronous actions
        driver.resume();
        
        // Make sure all the outgoing data goes out
        await driver.handleOutgoing();

        let canContinue = driver.handleSyncResponses();

        database.set(driver.gameState);

        while(!database.get().completed && !canContinue) {
            await driver.asyncResponseAvailable();
            // Receive the event
            for await(const [sourceHandler, message] of driver.receiveAsyncResponses()) {
                // Process the event
                canContinue ||= handleEvent(sourceHandler, message);
            }
        }
    }
})();