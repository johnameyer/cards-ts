import 'mocha';
import { Card, Deck, Rank, Suit } from '../src/index.js';
import { expect } from 'chai';

describe('Deck', () => {
    describe('#constructor', () => {
        it('should create with proper number of cards', () => {
            let deck: Deck = new Deck(1);
            expect(deck.cards).to.have.length(54);

            deck = new Deck(2);
            expect(deck.cards).to.have.length(54 * 2);

            deck = new Deck(2, false);
            expect(deck.cards).to.have.length(54 * 2);
            expect(deck.cards[0].equals(new Card(Suit.DIAMONDS, Rank.TWO))).to.be.true;
        });
    });

    describe('#draw', () => {
        it('should grab a card', () => {
            const deck: Deck = new Deck(1);
            const drawn: Card[] = [];
            const card = deck.draw();
            expect(card).to.be.ok;
            expect(drawn.find((x) => card.equals(x))).to.be.undefined;
            drawn.push(card);
        });
        
        it('should grab and return all 54 cards', () => {
            const deck: Deck = new Deck(1);
            const drawn: Card[] = [];
            let card: Card;
            for(let i = 0; i < 54; i++) {
                card = deck.draw();
                expect(card).to.be.ok;
                expect(drawn.find((x) => card.equals(x))).to.be.undefined;
                drawn.push(card);
            }
            expect(deck.draw()).to.be.undefined;
        });
    });

    describe('#toString', () => {
        it('should return human-readable form', () => {
            const deck: Deck = new Deck(1);
            expect(deck.toString()).to.contain('Deck');
            expect(deck.toString()).to.contain('54');

            deck.draw();
            expect(deck.toString()).to.contain('53');
        });
    });
});
