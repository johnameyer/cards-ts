import { GameHandlerParams } from '../game-handler-params';
import { ResponseMessage } from '../messages/response-message';
import { AbstractHandsController, Card, GenericControllerProvider, GenericHandlerController, GlobalController, Serializable, SystemHandlerParams } from '@cards-ts/core';

export interface PassingState {
    [key: string]: Serializable;

    pass: number;

    passed: Card[][];
}

type PassingDependencies = { hand: AbstractHandsController<any>, players: GenericHandlerController<ResponseMessage, GameHandlerParams & SystemHandlerParams> };

export class PassingControllerProvider implements GenericControllerProvider<PassingState, PassingDependencies, PassingController> {
    controller(state: PassingState, controllers: PassingDependencies): PassingController {
        return new PassingController(state, controllers);
    }

    initialState(controllers: PassingDependencies): PassingState {
        return {
            pass: 1,
            passed: new Array(controllers.players.count).fill(undefined),
        };
    }

    dependencies() {
        return { hand: true, players: true } as const;
    }
}

export class PassingController extends GlobalController<PassingState, PassingDependencies> {
    

    validate() {
        if(!Array.isArray(this.state.passed)) {
            throw new Error('Shape of passing is wrong');
        }
    }

    setPassedFor(position: number, passed: Card[]) {
        this.state.passed[position] = passed;
    }

    get pass() {
        return this.state.pass;
    }

    get passed() {
        return this.state.passed;
    }

    nextPass() {
        if(this.state.pass === this.controllers.players.count / 2) { // handles even number going from across to keep
            this.state.pass = 0;
        } else if(this.state.pass > 0) { // 1 to the right goes to 1 to the left
            this.state.pass = -this.state.pass;
        } else { // 1 to the left goes to 2 to the right
            this.state.pass = -this.state.pass + 1;
        }

        if(this.state.pass > this.controllers.players.count / 2) { // 2 to the left in 5 person game goes to keep
            this.state.pass = 0;
        }
    }

    resetPassed() {
        this.state.passed = new Array(this.controllers.players.count).fill(undefined);
    }
}
