import 'mocha';
import { expect } from 'chai';
import { Card } from '../src/index.js';

describe('Card', () => {
    let J: Card, TH: Card, FH: Card, QH: Card, AH: Card, AC: Card, AS: Card;
    beforeEach(() => {
        J = Card.fromString('*');
        TH = Card.fromString('2H');
        FH = Card.fromString('4H');
        QH = Card.fromString('QH');
        AH = Card.fromString('AH');
        AC = Card.fromString('AC');
        AS = Card.fromString('AS');
    });
    describe('#compare', () => {
        it('should sort by rank', () => {
            const cards = [ QH, AH, FH ].sort(Card.compare);
            expect(cards).to.deep.equal([ FH, QH, AH ]);
        });

        it('should sort by suit', () => {
            const cards = [ AC, AS, AH ].sort(Card.compare);
            expect(cards).to.deep.equal([ AC, AH, AS ]);
        });

        it('should sort by suit then rank', () => {
            const cards = [ QH, AH, AC, AS, FH ].sort(Card.compare);
            expect(cards).to.deep.equal([ FH, QH, AC, AH, AS ]);
        });

        it('should put wilds at the bottom', () => {
            const cards = [ AC, TH, J ].sort(Card.compare);
            expect(cards).to.deep.equal([ J, TH, AC ]);
        });
    });

    describe('#equals', () => {

    });
});
