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

    // TODO toggle updating names

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

        expect(flattened.start).to.equal('first');

        // @ts-ignore
        expect(flattened.states.first.defaultTransition).to.equal('second');

        // @ts-ignore
        expect(flattened.states.second.defaultTransition).to.equal('second_outer');
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

        expect(flattened.start).to.equal('first_outer');

        // @ts-ignore
        expect(flattened.states.first_outer.defaultTransition).to.equal('first');

        // @ts-ignore
        expect(flattened.states.first.defaultTransition).to.equal('second');
    });

    // recursive nodes
});
