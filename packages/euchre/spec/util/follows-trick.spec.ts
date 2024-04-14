import { expect } from 'chai';
import 'mocha';
import { followsTrick } from '../../src/util/follows-trick.js';
import { Card, Rank, Suit } from '@cards-ts/core';

const get = Card.fromString;

describe('util/followsTrick', () => {
    const JH = get('JH');
    const QH = get('QH');
    const KH = get('KH');
    const AH = get('AH');
    const NINEC = get('9C');
    const TENC = get('10C');
    const AC = get('AC');
    const JC = get('JC');
    const AD = get('AD');
    const JD = get('JD');

    it('should approve non-jack cards of the same suit', () => {
        [ QH, KH, AH, NINEC, TENC, AC, AD ].forEach(card => {
            const trick = [ new Card(card.suit, Rank.NINE) ];
            expect(followsTrick(trick, Suit.HEARTS, card)).to.be.ok;
        });
    });
    
    it('should approve card with same suit as trump', () => {
        [ JH, QH, KH, AH, NINEC, TENC, JC, AC, AD, JD ].forEach(card => {
            const trick = [ new Card(card.suit, Rank.NINE) ];
            expect(followsTrick(trick, card.suit, card)).to.be.ok;
        });
    });

    it('should allow left bower when trump was led', () => {
        let trick = [ get('9D') ];
        expect(followsTrick(trick, Suit.DIAMONDS, JH)).to.be.ok;
        
        trick = [ get('9H') ];
        expect(followsTrick(trick, Suit.HEARTS, JD)).to.be.ok;
    });

    it('should allow trump when left bower was led', () => {
        let trick = [ JH ];
        expect(followsTrick(trick, Suit.DIAMONDS, get('9D'))).to.be.ok;
        
        trick = [ JD ];
        expect(followsTrick(trick, Suit.HEARTS, get('9H'))).to.be.ok;
    });

    it('should disallow normal cards of wrong suit', () => {
        [ JH, QH, KH, AH ].forEach(card => {
            const trick = [ get('9S') ];
            expect(followsTrick(trick, Suit.SPADES, card)).not.to.be.ok;
        });

        [ NINEC, TENC, JC, AC ].forEach(card => {
            const trick = [ get('9S') ];
            expect(followsTrick(trick, Suit.DIAMONDS, card)).not.to.be.ok;
        });
    });

    it('should disallow left bower when trump not led', () => {
        const trick = [ get('9S') ];
        expect(followsTrick(trick, Suit.DIAMONDS, JH)).not.to.be.ok;
        
        expect(followsTrick(trick, Suit.HEARTS, JD)).not.to.be.ok;
    });
});
