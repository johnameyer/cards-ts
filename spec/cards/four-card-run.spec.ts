import { expect } from 'chai';
import 'mocha';
import { Card } from '../../lib/cards/card';
import { FourCardRun } from '../../lib/cards/four-card-run';
import { InvalidError } from '../../lib/cards/invalid-error';
import { Rank } from '../../lib/cards/rank';
import { Suit } from '../../lib/cards/suit';

const get = Card.fromString;

describe('FourCardRun', () => {
    let J: Card, THREE: Card, FIVE: Card, JH: Card, QH: Card, KH: Card, AH: Card, JC: Card;

    beforeEach(() => {
        J = get('*');
        THREE = get('3H');
        FIVE = get('5H');
        JH = get('JH');
        QH = get('QH');
        KH = get('KH');
        AH = get('AH');
        JC = get('JC');
    });

    describe('#constructor', () => {
        it('should allow construction with valid cards', () => {
            let run: FourCardRun = new FourCardRun([JH, QH, KH, AH]);
            expect(run).to.be.ok;

            run = new FourCardRun([JH, QH, KH, J]);
            expect(run).to.be.ok;
        });

        it('should not allow construction for unordered', () => {
            expect(() => new FourCardRun([QH, KH, AH, J])).to.throw(Error);

            expect(() => new FourCardRun([J, J, AH])).to.throw(Error);

            expect(() => new FourCardRun([JC, QH, KH, AH])).to.throw(Error);
        });

        it('should not allow construction with invalid', () => {
            expect(() =>  new FourCardRun([QH, KH, AH])).to.throw(Error);

            expect(() =>  new FourCardRun([J, J, AH])).to.throw(Error);

            expect(() => new FourCardRun([JC, QH, KH, AH])).to.throw(Error);

            expect(() => new FourCardRun([QH, KH, AH, J])).to.throw(Error);
        });
    });

    describe('#range', () => {
        it('should give the range of the cards', () => {
            let run: FourCardRun = new FourCardRun([JH, QH, KH, AH]);
            let range: [Rank, Rank] = run.range();
            expect(range[0]).to.equal(Rank.JACK);
            expect(range[1]).to.equal(Rank.ACE);

            run = new FourCardRun([J, QH, KH, J]);
            range = run.range();
            expect(range[0]).to.equal(Rank.JACK);
            expect(range[1]).to.equal(Rank.ACE);
            
            run = new FourCardRun([THREE, J, FIVE, J]);
            range = run.range();
            expect(range[0]).to.equal(Rank.THREE);
            expect(range[1]).to.equal(Rank.SIX);
        });
    });

    describe('#findSpots', () => {
        it('should find open spots', () => {
            let run: FourCardRun = new FourCardRun([JH, QH, KH, AH]);
            let spots: Rank[] = [...run.findSpots()];
            expect(spots).to.have.length(3);
            expect(spots).to.contain(Rank.TEN);

            run = new FourCardRun([J, JH, QH, J, AH]);
            spots = [...run.findSpots()];
            expect(spots).to.have.length(5);
            [Rank.NINE, Rank.TEN, Rank.KING].forEach((rank) => {
                expect(spots).to.contain(rank);
            });
        });
    });

    describe('#findSpotFor', () => {
        it('should check for an open spot', () => {
            let run: FourCardRun = new FourCardRun([JH, QH, KH, AH]);
            let spot: number = run.findSpotFor(J);
            expect(spot).to.equal(0);
            spot = run.findSpotFor(Rank.TEN);
            expect(spot).to.equal(0);

            run = new FourCardRun([J, JH, QH, J, AH]);
            spot = run.findSpotFor(Rank.NINE);
            expect(spot).to.equal(0);

            spot = run.findSpotFor(Rank.TEN);
            expect(spot).to.equal(0);

            spot = run.findSpotFor(Rank.KING);
            expect(spot).to.equal(3);
        });
    });

    describe('#add', () => {
        it('should add a card', () => {
            const run: FourCardRun = new FourCardRun([J, JH, QH, KH]);
            let card: Card = new Card(Suit.HEARTS, Rank.TEN, 1);
            run.add(card);
            expect(run.cards.findIndex((find) => find.deck === card.deck)).to.equal(0);

            card = new Card(Suit.HEARTS, Rank.JOKER, 2);
            run.add(card, false);
            expect(run.cards.findIndex((find) => find.deck === card.deck)).to.equal(0);

            card = new Card(Suit.HEARTS, Rank.JOKER, 3);
            run.add(card);
            expect(run.cards.findIndex((find) => find.deck === card.deck)).to.equal(0);
        });

        it('should error for invalid add', () => {
            const run: FourCardRun = new FourCardRun([J, J, QH, KH]);
            let card: Card = new Card(Suit.SPADES, Rank.TEN, 1);
            expect(() => run.add(card)).to.throw(Error);

            card = new Card(Suit.NONE, Rank.JOKER, 2);
            expect(() => run.add(card)).to.throw(Error);
        });
    });

    describe('#isLive', () => {
        it('should check if live', () => {
            const run: FourCardRun = new FourCardRun([J, JH, QH, KH]);
            let card: Card = new Card(Suit.HEARTS, Rank.TEN, 1);
            let live: boolean = run.isLive(card);
            expect(live).to.be.true;

            card = new Card(Suit.SPADES, Rank.TEN, 1);
            live = run.isLive(card);
            expect(live).to.be.false;
        });
    });

    describe('#liveCards', () => {
        it('should contain live cards', () => {
            let run: FourCardRun = new FourCardRun([JH, QH, KH, AH]);
            let liveCards: Card[] = [...run.liveCards()];
            [J, get('10H')].forEach((card) => {
                expect(liveCards.find((x) => x.equals(card))).to.not.be.undefined;
            });
            // use member?

            run = new FourCardRun([J, QH, KH, AH]);
            liveCards = [...run.liveCards()];
            [J, get('10H'), JH].forEach((card) => {
                expect(liveCards.find((x) => x.equals(card))).to.not.be.undefined;
            });

            run = new FourCardRun([JH, QH, KH, J]);
            liveCards = [...run.liveCards()];
            [J, get('10H'), AH].forEach((card) => {
                expect(liveCards.find((x) => x.equals(card))).to.not.be.undefined;
            });
        });
    });
});
