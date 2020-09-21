import 'mocha';
import { expect } from 'chai';
import { Card } from '@cards-ts/core';
import { find } from '../src/util/find';

function lengths(arr: any[][]) {
    return arr.map(subarr => subarr.length);
}

describe('find', () => {
    describe('3 3', () => {
        const sought: (3 | 4)[] = [3, 3];
        it('finds none with empty set', () => {
            const cards = [].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(6);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([0, 0]);
        });
    
        it('finds a singular with a single card', () => {
            const cards = ['AS'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(5);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([1, 0]);
        });
    
        it('finds a pair', () => {
            const cards = ['JS', 'JH'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(4);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([2, 0]);
        });
    
        it('finds a three of a kind', () => {
            const cards = ['AS', 'AH', 'AC'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(3);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([3, 0]);
        });
    
        it('finds four of a kind', () => {
            const cards = ['AS', 'AH', 'AC', 'AS'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(3);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([4, 0]);
        });
    
        it('finds three of a kind plus one', () => {
            const cards = ['AS', 'AH', 'AC', '3S'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(2);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([3, 1]);
        });
    
        it('finds three of a kind plus pair', () => {
            const cards = ['AS', 'AH', 'AC', '3S', '3S'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(1);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([3, 2]);
        });

        it('finds two three of a kinds', () => {
            const cards = ['AS', 'AH', 'AC', '3S', '3S', '3H'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(0);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([3, 3]);
        });

        it('finds two three of a kinds with a wild', () => {
            const cards = ['AS', 'AH', 'AC', '3S', '3S', '2H'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(0);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([3, 3]);
        });

        it('finds two three of a kinds with two wilds', () => {
            const cards = ['AS', 'AH', '2C', '3S', '3S', '2H'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(0);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([3, 3]);
        });

        it('finds two pair with two wilds', () => {
            const cards = ['AS', '2C', '3S', '2H'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(2);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([2, 2]);
        });

        it('should minimzed unused value', () => {
            const cards = ['3S', '3S', '3H', '9H', '9C', 'AS', 'AH', 'AC', '2C'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(0);
            expect(unusedValue).to.equal(10);
            expect(lengths(chosen)).to.have.members([3, 4]);
        });

        it('should use wilds properly', () => {
            const cards = ['3S', '3S', '9H', '9C', '2C', '2C', '*', '*'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(0);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([4, 4]);
        });

        it('should not use excess wilds', () => {
            const cards = ['3S', '3S', '9H', '9C', '2C', '2C', '*', '*', '*'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(0);
            expect(unusedValue).to.equal(20);
            expect(lengths(chosen)).to.have.members([4, 4]);
        });
    });

    describe('3 3 3', () => {
        const sought: (3 | 4)[] = [3, 3, 3];
        it('finds none with empty set', () => {
            const cards = [].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(9);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([0, 0, 0]);
        });
    
        it('finds a singular with a single card', () => {
            const cards = ['AS'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(8);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([1, 0, 0]);
        });
    
        it('finds a pair', () => {
            const cards = ['JS', 'JH'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(7);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([2, 0, 0]);
        });
    
        it('finds a three of a kind', () => {
            const cards = ['AS', 'AH', 'AC'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(6);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([3, 0, 0]);
        });
    
        it('finds four of a kind', () => {
            const cards = ['AS', 'AH', 'AC', 'AS'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(6);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([4, 0, 0]);
        });
    
        it('finds three of a kind plus one', () => {
            const cards = ['AS', 'AH', 'AC', '3S'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(5);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([3, 1, 0]);
        });
    
        it('finds three of a kind plus pair', () => {
            const cards = ['AS', 'AH', 'AC', '3S', '3S'].map(Card.fromString);
            const [missing, unusedValue, chosen] = find(cards, sought);
            expect(missing).to.equal(4);
            expect(unusedValue).to.equal(0);
            expect(lengths(chosen)).to.have.members([3, 2, 0]);
        });
    });

    //TODO add account for other players?
});
