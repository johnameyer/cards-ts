import { AbstractHandsController, Card, GenericControllerProvider, GenericHandlerController, GlobalController, Serializable } from '@cards-ts/core';

export interface WarState {
    [key: string]: Serializable;

    playedCards: Card[][];

    battleCount: number;
}

type WarDependencies = { hand: AbstractHandsController<any>, players: GenericHandlerController<any, any> };

export class WarControllerProvider implements GenericControllerProvider<WarState, WarDependencies, WarController> {
    controller(state: WarState, controllers: WarDependencies): WarController {
        return new WarController(state, controllers);
    }

    initialState(controllers: WarDependencies): WarState {
        return {
            playedCards: new Array(controllers.players.count).fill(undefined)
                .map(() => []),
            battleCount: 0,
        };
    }

    dependencies() {
        return { hand: true, players: true } as const;
    }
}

export class WarController extends GlobalController<WarState, WarDependencies> {
    validate() {
        if(!Array.isArray(this.state.playedCards)) {
            throw new Error('Shape of object is wrong');
        }
    }

    public battleWinner() {
        const compared = this.state.playedCards.map(cards => cards[cards.length - 1].rank);

        let max = 0;
        for(let i = 1; i < compared.length; i++) {
            if(compared[i].difference(compared[max]) <= 0) {
                max = i;
            }
        }
        return compared.findIndex(rank => rank === compared[max]) === max ? max : -1;
    }

    public givePlayedTo(max: number) {
        this.controllers.hand.giveCards(max, this.state.playedCards.flat());
    }

    public resetPlayed() {
        this.state.playedCards = new Array(this.controllers.players.count).fill(undefined)
            .map(() => []);
    }

    public get battleCountAndOne() {
        return this.state.battleCount++;
    }

    public getMaxPlayed() {
        return Math.max(...this.state.playedCards.map(cards => cards.length));
    }

    public flipCards() {
        for(let i = 0; i < this.state.playedCards.length; i++) {
            const flipped = this.controllers.hand.shift(i);
            if(flipped) {
                this.state.playedCards[i].push(flipped);
            }
        }
    }

    public getLastFlipped() {
        const flipped = [];
        for(let i = 0; i < this.state.playedCards.length; i++) {
            flipped.push(this.state.playedCards[i][this.state.playedCards[i].length - 1]);
        }
        return flipped;
    }
}
