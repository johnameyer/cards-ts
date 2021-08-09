import { Card } from '../cards/card';
import { GenericHandlerController } from '../games/generic-handler-controller';
import { SystemHandlerParams } from '../handlers/system-handler';
import { isDefined } from '../util/is-defined';
import { GenericControllerProvider, GlobalController } from './controller';
import { DeckController } from './deck-controller';
import { HandsController } from './hands-controller';
import { TurnController } from './turn-controller';

type TricksState = {
    currentTrick: (Card | undefined)[];

    leader: number;

    playedCard: Card;

    tricks: number;
}

type TricksDependencies = {
    deck: DeckController;
    players: GenericHandlerController<any, SystemHandlerParams>;
    hand: HandsController;
    turn: TurnController;
};

export class TricksControllerProvider implements GenericControllerProvider<TricksState, TricksDependencies, TricksController> {
    controller(state: TricksState, controllers: TricksDependencies): TricksController {
        return new TricksController(state, controllers);
    }

    initialState(): TricksState {
        return {
            currentTrick: [],
            leader: 0,
            playedCard: undefined as any as Card,
            tricks: 0,
        };
    }


    dependencies() {
        return { deck: true, players: true, hand: true, turn: true } as const;
    }
}

export class TricksController extends GlobalController<TricksState, TricksDependencies> {
    override validate() {
        if(this.state.currentTrick && !Array.isArray(this.state.currentTrick)) {
            throw new Error('Shape of tricks is wrong');
        }
    }

    setPlayedCard(card: Card) {
        this.state.playedCard = card;
    }

    resetLeader() {
        this.state.leader = (this.controllers.deck.dealer + 1) % this.controllers.players.count;
        this.controllers.turn.set(this.state.leader);
    }

    resetTrick() {
        this.state.currentTrick = [];
        this.controllers.turn.set(this.state.leader);
    }

    reset() {
        this.resetTrick();
        this.state.tricks = 0;
    }

    get leader() {
        return this.state.leader;
    }

    set leader(leader: number) {
        this.state.leader = leader % this.controllers.players.count;
        this.resetTurn();
    }

    resetTurn() {
        this.controllers.turn.set(this.state.leader);
    }

    addCard(card: Card | undefined) {
        this.state.currentTrick.push(card);
    }

    handlePlayed() {
        const playedCard = this.state.playedCard;
        this.state.playedCard = undefined as any as Card;
        this.addCard(playedCard);
        this.controllers.hand.removeCards(this.controllers.turn.get(), [ playedCard ]);
        return playedCard;
    }

    trickIsCompleted() {
        return this.controllers.turn.get() === this.leader && this.state.currentTrick.filter(isDefined).length > 1;
    }

    /**
     * @param comparator a function returning true if the current card is better than the previous
     */
    findWinner(comparator: (current: Card, previous: Card) => boolean, followsSuit = false) {
        const first = this.state.currentTrick.findIndex(isDefined);
        let winningPlayer = first;
        const leadingSuit = (this.state.currentTrick[first] as Card).suit;
        for(let i = first + 1; i < this.controllers.players.count; i++) {
            const card = this.state.currentTrick[i];
            if(card) {
                if(!followsSuit || card.suit === leadingSuit) {
                    if(comparator(card, this.state.currentTrick[winningPlayer] as Card)) {
                        winningPlayer = i;
                    }
                }
            }
        }
        return winningPlayer;
    }

    get currentTrick(): ReadonlyArray<Card | undefined> {
        return this.state.currentTrick.slice();
    }

    incrementTricks() {
        this.state.tricks++;
    }

    get tricks() {
        return this.state.tricks;
    }
}

// TODO make a version that guarantees all cards in trick are defined? Should remove a few casts in Hearts
