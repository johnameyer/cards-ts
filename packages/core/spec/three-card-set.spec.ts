import { expect } from 'chai';
import 'mocha';
import { Card, ThreeCardSet } from '../src';

describe('ThreeCardSet', () => {
    let J: Card, TH: Card, QS: Card, QH: Card, QC: Card, KH: Card;

    beforeEach(() => {
        J = Card.fromString('*');
        TH = Card.fromString('2H');
        QS = Card.fromString('QS');
        QH = Card.fromString('QH');
        QC = Card.fromString('QC');
        KH = Card.fromString('KH');
    });

    describe('#constructor', () => {
        it('should accept valid cards', () => {
            let set: ThreeCardSet = new ThreeCardSet([QS, QH, QC]);
            expect(set).to.be.ok;
            expect(set.cards).to.have.length(3);
            expect(set.wilds).to.have.length(0);

            set = new ThreeCardSet([TH, QS, QH, QC]);
            expect(set).to.be.ok;
            expect(set.cards).to.have.length(4);
            expect(set.wilds).to.have.length(1);

            set = new ThreeCardSet([J, TH, QS, QH, QC]);
            expect(set).to.be.ok;
            expect(set.cards).to.have.length(5);
            expect(set.wilds).to.have.length(2);

            set = new ThreeCardSet([J, J, TH, QS, QH, QC]);
            expect(set).to.be.ok;
            expect(set.cards).to.have.length(6);
            expect(set.wilds).to.have.length(3);
        });

        it('should not accept invalid cards', () => {
            expect(() => {
                new ThreeCardSet([J, J, J]);
            }).to.throw(Error, 'No non-wilds');

            expect(() => {
                new ThreeCardSet([J, J, QH]);
            }).to.throw(Error, 'Too many wilds');

            expect(() => {
                new ThreeCardSet([J, QH, KH]);
            }).to.throw(Error, 'Card not of the right rank');
        });
    });

    describe('#isLive', () => {
        it('should tell if card is live', () => {
            let set: ThreeCardSet = new ThreeCardSet([QS, QH, QC]);
            let result: boolean = set.isLive(QS);
            expect(result).to.be.true;

            result = set.isLive(J);
            expect(result).to.be.true;

            result = set.isLive(KH);
            expect(result).to.not.be.true;

            set = new ThreeCardSet([J, J, QS, QH]);
            result = set.isLive(QS);
            expect(result).to.be.true;

            result = set.isLive(J);
            expect(result).to.not.be.true;

            result = set.isLive(KH);
            expect(result).to.not.be.true;
        });
    });

    describe('#liveCards', () => {

    });

    describe('#add', () => {

    });
});
