import { expect } from 'chai';
import { Machine, NestedMachine } from '../src/index.js';
import { flatten } from '../src/util.js';
import { MockControllers } from './helpers.js';

/* eslint-disable camelcase */

describe.only('flatten', () => {
    const simple: Machine<MockControllers> = {
        start: 'first',
        states: {
            first: {
                defaultTransition: 'second',
            },
            second: {},
        },
    };

    it('keeps machine the same if already flat', () => {
        const flattened = flatten(simple);

        expect(flattened).to.deep.equal(simple);
    });
    
    it('keeps transitions when nesting entries', () => {
        const nested: NestedMachine<MockControllers> = {
            start: 'first_outer',
            states: {
                first_outer: {
                    run: simple,
                    defaultTransition: 'second_outer',
                },
                second_outer: {
                },
            },
        };

        const flattened = flatten(nested);

        expect(flattened.start).to.equal('first_outer_first');

        // @ts-ignore
        expect(flattened.states.first_outer_first?.defaultTransition).to.equal('first_outer_second');

        // @ts-ignore
        expect(flattened.states.first_outer_second.defaultTransition).to.equal('second_outer');
    });

    it('keeps transitions when nesting targets', () => {
        const nested: NestedMachine<MockControllers> = {
            start: 'first_outer',
            states: {
                first_outer: {
                    defaultTransition: 'second_outer',
                },
                second_outer: {
                    run: simple,
                },
            },
        };

        const flattened = flatten(nested);

        console.log(flattened);

        expect(flattened.start).to.equal('first_outer');

        // @ts-ignore
        expect(flattened.states.first_outer.defaultTransition).to.equal('second_outer_first');

        // @ts-ignore
        expect(flattened.states.second_outer_first.defaultTransition).to.equal('second_outer_second');
    });

    // recursive nodes
});
