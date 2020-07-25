import { expect } from 'chai';
import { beforeEach } from 'mocha';
import 'mocha';
import { Card } from '../../lib/cards/card';
import { GameState } from '../../lib/cards/game-state';
import { HandlerHelper } from '../helper/handler-helper';
import { defaultParams } from '../../lib';

describe('GameState', () => {
    let game: GameState;
    let handlerOne: HandlerHelper;
    let handlerTwo: HandlerHelper;

    beforeEach(() => {
        handlerOne = new HandlerHelper();
        handlerTwo = new HandlerHelper();
        game = new GameState(2, defaultParams);
    });

    describe('#constructor', () => {
        it('should set up players', () => {
            // TODO
            expect(game).to.be.ok;
        });
    });

    // describe('#dealOut', () => {
    //     it('should deal the proper number of cards to each player', () => {
    //         game.dealOut();
    //         let expectedCards: number = game.getNumToDeal();
    //         expect(handlerOne.cards).to.have.length(expectedCards);
    //         expect(handlerTwo.cards).to.have.length(expectedCards);
    //         game.nextRound();

    //         handlerOne.clear();
    //         handlerTwo.clear();

    //         game.dealOut();
    //         expectedCards = game.getNumToDeal();
    //         expect(handlerOne.cards).to.have.length(expectedCards);
    //         expect(handlerTwo.cards).to.have.length(expectedCards);
    //     });
    // });

    describe('#getNumToDeal', () => {
        it('should return the proper amount', () => {
            expect(game.getNumToDeal()).to.be.ok.and.equal(7);

            game.nextRound();

            expect(game.getNumToDeal()).to.be.ok.and.equal(8);
        });
    });

    describe('#done', () => {
        it('should tell if the last round', () => {
            for (let i = 0; i < 6; i++) {
                expect(game.isLastRound()).to.be.false;
                game.nextRound();
            }
            expect(game.isLastRound()).to.be.true;
        });
    });

    describe('#nextRound', () => {
        it('should start the next round', () => {
            const round = game.round;
            const player = game.dealer;

            game.nextRound();

            expect(game.round).to.equal(round + 1);
            expect(game.dealer).to.not.equal(player);
        });
    });

    describe('#fromObj', () => {
        it('should create same object', () => {
            const state = new GameState(3, defaultParams);
            state.setupRound();
            const fromObj = GameState.fromObj(state);

            expect(state).to.deep.equal(fromObj);
        });
    });

    // describe('#isRoundOver', () => {
    //     it('should check if any player is done', () => {
    //         game.players.forEach((hand) => hand.dealCard(Card.fromString('*')));
    //         expect(game.isRoundOver()).to.be.false;

    //         game.players[0].resetHand();
    //         expect(game.isRoundOver()).to.be.true;
    //     });

    //     it('should message every player if done', () => {
    //         game.players.forEach((hand) => hand.hand = []);
    //         game.isRoundOver();
    //         expect(handlerOne.messages).to.have.length(1);
    //         expect(handlerTwo.messages).to.have.length(1);
    //     });
    // });
});
