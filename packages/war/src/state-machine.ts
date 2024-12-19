import { Controllers } from './controllers/controllers.js';
import { FlippedMessage, GameOverMessage, StalemateMessage, WonBattleMessage, WonWarMessage } from './messages/status/index.js';
import { SpacingMessage } from '@cards-ts/core';
import { handleAll, NestedMachine, sequence, loop, game, named } from '@cards-ts/state-machine';

const hasBattleWinner = (controllers: Controllers) => controllers.war.battleWinner() !== -1;

const outOfCards = (controllers: Controllers) => controllers.hand.numberOfPlayersWithCards() !== controllers.names.get().length;

const sendFlipMessage = (controllers: Controllers) => {
    const flipped = controllers.war.getLastFlipped();
    for(let i = 0; i < flipped.length; i++) {
        // TODO move these kinds of messages into controllers
        controllers.players.messageAll(new FlippedMessage(controllers.names.get(i), flipped[i]));
    }
};

const playCard = handleAll({
    handler: 'flip',
    // skipIf: // out of cards
    after: (controllers: Controllers) => controllers.war.flipCards(), // rename play card or similar since nothing is made visible to players
});


// trySequence

const round: NestedMachine<Controllers> = {
    start: 'initial',
    states: {
        initial: {
            run: sequence([
                playCard,
                named('flipMessage', sendFlipMessage),
            ]),
            transitions: [{
                state: 'battle',
                condition: controllers => !hasBattleWinner(controllers),
            }],
            defaultTransition: 'endRound',
        },
        endRound: { // TODO rename
            run: controllers => {
                const max = controllers.war.battleWinner();
                controllers.war.givePlayedTo(max);
                
                controllers.players.messageAll(new WonBattleMessage(controllers.names.get()[max]));
                controllers.players.messageAll(new SpacingMessage());

                controllers.war.incrementBattleCount();
            },
        },
        battle: {
            run: loop({
                id: 'flipping',
                run: 'run' in playCard ? playCard.run : playCard,
                breakingIf: controllers => (controllers.war.getMaxPlayed() - 1) % 4 === 0 || outOfCards(controllers),
                afterAll: sendFlipMessage,
            }),
            transitions: [{
                state: 'battle',
                condition: controllers => controllers.war.battleWinner() === -1,
            }],
            defaultTransition: 'endBattle',
        },
        endBattle: {
            run: controllers => {
                const max = controllers.war.battleWinner();
                controllers.war.givePlayedTo(max);
                
                controllers.players.messageAll(new WonWarMessage(controllers.names.get()[max]));
                controllers.players.messageAll(new SpacingMessage());

                controllers.war.incrementBattleCount();
            },
        },
    },
};

const rounds = loop<Controllers>({
    id: 'round',
    breakingIf: controllers => controllers.hand.numberOfPlayersWithCards() === 1 || controllers.war.battleCount >= controllers.params.get().maxBattles,
    run: round,
    afterEach: controllers => controllers.war.resetPlayed(),
});

export const stateMachine = game<Controllers>(
    controllers => {
        controllers.deck.resetDeck();
        controllers.hand.dealOut(false, false); // TODO allow for setting the number of cards to play with
    },
    rounds,
    controllers => {
        if(controllers.hand.numberOfPlayersWithCards() > 1) {
            controllers.players.messageAll(new StalemateMessage());
        } else {
            controllers.players.messageAll(new GameOverMessage(controllers.names.get(controllers.hand.handWithMostCards())));
        }
    },
);
