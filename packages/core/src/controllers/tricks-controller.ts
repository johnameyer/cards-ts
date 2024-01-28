import { Card } from '../cards/card.js';
import { GenericHandlerController } from '../games/generic-handler-controller.js';
import { SystemHandlerParams } from '../handlers/system-handler.js';
import { isDefined } from '../util/is-defined.js';
import { GenericControllerProvider, GlobalController } from './controller.js';
import { DeckController } from './deck-controller.js';
import { HandsController } from './hands-controller.js';
import { TurnController } from './turn-controller.js';

type TricksState = {
    /**
     * The cards currently played in the trick, with undefined for players who are not playing this round
     */
    currentTrick: (Card | undefined)[];

    /**
     * Who is leading / led the trick
     */
    leader: number;

    /**
     * The card that was just played
     */
    playedCard: Card;

    /**
     * The number of tricks so far
     */
    tricks: number;
}

type TricksDependencies = {
    deck: DeckController;
    players: GenericHandlerController<any, SystemHandlerParams>;
    hand: HandsController;
    turn: TurnController;
};

/**
 * @category Controller Provider
 */
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

/**
 * Handles state for trick based games
 * @category Controller
 */
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
     * @param followsSuit if the winner must be of the same suit
     */
    findWinner(comparator: (current: Card, previous: Card) => boolean, followsSuit = true) {
        // TODO consider adding a trumps parameter, or is there a better way?
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
