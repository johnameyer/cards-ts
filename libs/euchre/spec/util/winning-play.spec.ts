import { expect } from 'chai';
import { winningPlay } from '../../src/util/winning-play.js';
import { getComplementarySuit } from '../../src/util/suit-colors.js';
import { Card, Suit } from '@cards-ts/core';

const get = Card.fromString;

const shuffleTrick = function * (trick: (Card | undefined)[], originalWinner: number) {
    const [ first, ...rest ] = trick;
    for(const [ shuffledRest, winnerRest ] of shuffleHomogeneous(rest, originalWinner - 1)) {
        const trick = [ first, ...shuffledRest ];
        yield [ trick, originalWinner > 0 ? winnerRest + 1 : 0 ] as [(Card | undefined)[], number];
    }
};

const shuffleHomogeneous = function * ([ ...trick ]: (Card | undefined)[], originalWinner: number) {
    for(let i = 0; i < trick.length; i++) {
        yield [ trick, (originalWinner + trick.length - i) % trick.length ] as [(Card | undefined)[], number];
        trick = [ ...trick.slice(1), trick[0] ];
    }
};

describe('util/winningPlay', () => {
    const TENH = get('10H');
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
    const JS = get('JS');
    const AS = get('AS');

    
    it('should give it to first of one card', () => {
        [ JH, QH, AH, NINEC, JD, AD ].forEach(card => {
            const trick = [ card ];
            [ Suit.HEARTS, Suit.SPADES ].forEach(trumpSuit => {
                expect(winningPlay(trick, trumpSuit)).to.eq(0);
            });
        });
    });

    
    it('should not give it to an off-suit non-trump', () => {
        const cardSets = [[ TENH, AC ], [ TENH, TENC ], [ QH, AC ]];
        for(const trick of cardSets) {
            expect(winningPlay(trick, Suit.SPADES)).to.eq(0);
        }
    });

    it('should give it to the highest non-trump when no trumps are played', () => {
        const tricks = [[ TENH, QH, AH ], [ NINEC, TENC, JC ]];
        tricks.forEach(trick => {
            [ Suit.HEARTS, Suit.DIAMONDS ].forEach(trumpSuit => {
                for(const [ shuffled, winner ] of shuffleHomogeneous(trick, trick.length - 1)) {
                    expect(winningPlay(shuffled, trumpSuit)).to.eq(winner);
                }
            });
        });
    });
    
    it('should give it to the highest standard trump when no bowers are played', () => {
        const openings = [ AD, AS ];
        const followers = [[ TENH, QH, AH ], [ NINEC, TENC ]];
        for(const opening of openings) {
            for(const follower of followers) {
                for(let i = 1; i <= follower.length; i++) {
                    for(const [ shuffled, winner ] of shuffleTrick([ opening, ...follower.slice(0, i) ], i)) {
                        expect(winningPlay(shuffled, follower[0].suit)).to.eq(winner);
                    }
                }
                
            }
        }
    });

    it('should give it to the left bower without the right', () => {
        let tricks = [[ TENH, AC ], [ NINEC, TENC ], [ QH, AC ]];
        const bowers = [ JC, JH ];
        for(const trick of tricks) {
            for(const bower of bowers) {
                for(const [ shuffled, winner ] of shuffleHomogeneous([ ...trick, bower ], trick.length)) {
                    expect(winningPlay(shuffled, getComplementarySuit(bower.suit))).to.eq(winner);
                }
            }
        }

        tricks = [[ TENH, QH, AH, JD ], [ NINEC, TENC, JS ]];
        for(const trick of tricks) {
            for(const [ shuffled, winner ] of shuffleHomogeneous(trick, trick.length - 1)) {
                expect(winningPlay(shuffled, trick[0].suit)).to.eq(winner);
            }
        }
    });

    it('should give it to the right bower', () => {
        const tricks = [[ TENH, AC ], [ NINEC, TENC ], [ QH, AC, JS ]];
        const bowers = [ JC, JH ];
        for(const trick of tricks) {
            for(const bower of bowers) {
                for(const [ shuffled, winner ] of shuffleHomogeneous([ ...trick, bower ], trick.length)) {
                    expect(winningPlay(shuffled, bower.suit)).to.eq(winner);
                }
            }
        }
    });

    it('should handle undefined spots', () => {
        let tricks = [[ undefined, TENH, QH, AH ], [ NINEC, TENC, undefined, JC ]];
        for(const trick of tricks) {
            [ Suit.HEARTS, Suit.DIAMONDS ].forEach(trumpSuit => {
                for(const [ shuffled, winner ] of shuffleHomogeneous(trick, trick.length - 1)) {
                    expect(winningPlay(shuffled, trumpSuit)).to.eq(winner);
                }
            });
        }

        tricks = [[ TENH, AC, undefined ], [ NINEC, undefined, TENC ], [ QH, undefined, JS ]];
        const bowers = [ JC, JH ];
        for(const trick of tricks) {
            for(const bower of bowers) {
                for(const [ shuffled, winner ] of shuffleHomogeneous([ ...trick, bower ], trick.length)) {
                    expect(winningPlay(shuffled, bower.suit)).to.eq(winner);
                }
            }
        }
    });
});
