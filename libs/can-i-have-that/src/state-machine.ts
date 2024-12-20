import { Controllers } from './controllers/controllers.js';
import { StartRoundMessage } from './messages/status/index.js';
import { setupRound } from './util/setup-round.js';
import { giveCard } from './util/give-card.js';
import { PickupMessage as PublicPickup, PlayedMessage, InvalidError, ReshuffleMessage, DiscardMessage, OutOfCardsMessage, EndRoundMessage, SpacingMessage } from '@cards-ts/core';
import { handleRoundRobinFirst, handleSingle, loop, sequence, game } from '@cards-ts/state-machine';

const messageAboutPlayed = (controllers: Controllers) => {
    if(controllers.melds.toPlay.length) {
        for(const meld of controllers.melds.toPlay) {
            controllers.players.messageOthers(controllers.turn.get(), new PlayedMessage(meld.cards, meld, controllers.names.get(controllers.turn.get())));
        }
        controllers.melds.get()[controllers.turn.get()] = controllers.melds.toPlay;
    }
    
    if(controllers.melds.toPlayOnOthers.length) {
        for(let position = 0; position < controllers.melds.get().length; position++) {
            if(!controllers.melds.toPlayOnOthers[position] || !controllers.melds.toPlayOnOthers[position].length) {
                continue;
            }
            for(let meld = 0; meld < controllers.melds.get()[position].length; meld++) {
                if(!controllers.melds.toPlayOnOthers[position][meld] || !controllers.melds.toPlayOnOthers[position][meld].length) {
                    continue;
                }
                controllers.players.messageOthers(controllers.turn.get(), new PlayedMessage(controllers.melds.toPlayOnOthers[position][meld], controllers.melds.get()[position][meld], controllers.names.get(controllers.turn.get())));
            }
        }
    }
};

const giveCardToTurnPlayer = (controllers: Controllers) => {
    const whoseTurn = controllers.turn.get();
        
    let draw = controllers.deck.deck.draw();
    if(!draw) {
        if(!controllers.deck.deck.shuffleDiscard()) {
            // TODO add another deck?
            throw new InvalidError('Deck ran out of cards');
        } else {
            controllers.players.messageAll(new ReshuffleMessage());
            draw = controllers.deck.deck.draw();
        }
    }
    giveCard(controllers, whoseTurn, draw);
};

const ask = handleRoundRobinFirst<Controllers>({
    handler: 'wantCard',
    controller: controllers => controllers.ask,
    startingPosition: controllers => controllers.turn.get(),
    hasResponded: controllers => controllers.canIHaveThat.wantCard!,
    afterResponse: controllers => {
        const whoseAsk = controllers.ask.get();
        const card = controllers.deck.deck.top;
        
        if(!card) {
            throw new Error('Invalid State');
        }
        
        if(controllers.ask.get() === controllers.turn.get()) {
            giveCard(controllers, controllers.turn.get(), card);
            controllers.players.messageOthers(controllers.turn.get(), new PublicPickup(card, controllers.names.get(controllers.turn.get()), false));
            controllers.deck.deck.takeTop();
        } else {            
            let draw = controllers.deck.deck.draw();
            if(!draw) {
                if(!controllers.deck.deck.shuffleDiscard()) {
                    // TODO add another deck?
                    throw new InvalidError('Deck ran out of cards');
                } else {
                    controllers.players.messageAll(new ReshuffleMessage());
                    draw = controllers.deck.deck.draw();
                }
            }
            giveCard(controllers, whoseAsk, card, draw);
            controllers.players.messageOthers(whoseAsk, new PublicPickup(card, controllers.names.get(whoseAsk), true));
            controllers.deck.deck.takeTop();

            // can we integrate this across the branches / with the branch for the player turn?
            giveCardToTurnPlayer(controllers);
        }
    },
    afterNone: controllers => {
        if(controllers.deck.deck.top !== null) { // otherwise invalid state
            controllers.players.messageAll(new PublicPickup(controllers.deck.deck.top));
            controllers.deck.deck.clearTop();
        }
        
        giveCardToTurnPlayer(controllers);
    },
});

const turn = handleSingle<Controllers>({
    handler: 'turn',
    position: controllers => controllers.turn.get(),
    before: controllers => {
        controllers.melds.resetTransient();
    },
    after: controllers => {
        messageAboutPlayed(controllers);

        if(controllers.deck.toDiscard) {
            // TODO move into deck handler as well?
            controllers.players.messageOthers(controllers.turn.get(), new DiscardMessage(controllers.deck.toDiscard, controllers.names.get(controllers.turn.get())));
        
            controllers.deck.discard();
        }
        
        if(controllers.hand.get(controllers.turn.get()).length !== 0) {
            controllers.turn.next();
        }
    },
});

const turns = loop({
    id: 'turn',
    breakingIf: controllers => controllers.hand.get(controllers.turn.get()).length === 0,
    run: sequence<Controllers>([ // TODO handleLoop i.e. call xyz at the core and also handle the turn or turnWhileHavingCards?
        ask,
        turn,
    ]),
    afterAll: controllers => {
        controllers.players.messageAll(new OutOfCardsMessage(controllers.names.get(controllers.turn.get())));
        controllers.score.decreaseScore(controllers.turn.get(), 10);
    },
});

const round = loop({
    id: 'round',
    breakingIf: controllers => controllers.canIHaveThat.round === controllers.params.get().rounds.length,
    beforeEach: controllers => {
        setupRound(controllers);
        controllers.players.messageAll(new StartRoundMessage(controllers.canIHaveThat.getRound()));
        controllers.hand.dealOut(true, true, controllers.canIHaveThat.getNumToDeal());
        
        const top = controllers.deck.deck.flip();
        controllers.players.messageAll(new DiscardMessage(top));
        
        controllers.turn.set((controllers.deck.dealer + 1) % controllers.players.count);
    },
    run: turns,
    afterEach: controllers => {
        controllers.canIHaveThat.nextRound();
        for(let player = 0; player < controllers.players.count; player++) {
            controllers.score.increaseScore(player, controllers.hand.get(player).map(card => card.rank.value)
                .reduce((a, b) => a + b, 0));
        }
        
        controllers.players.messageAll(new EndRoundMessage(controllers.names.get(), controllers.score.get()));
        controllers.players.messageAll(new SpacingMessage());
    },
});

export const stateMachine = game<Controllers>(
    undefined, // start game - state should already be clean so no-op
    round,
    controllers => { 
        // TODO winner message?
    },
);
