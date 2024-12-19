/*
 * import { expect } from 'chai';
 * import 'mocha';
 * import { Machine, MockControllers, buildTransitions, advance } from './helpers.js';
 */

/*
 * const simpleMachine: Machine<MockControllers> = {
 *     start: 'one',
 *     end: [ 'two' ],
 *     states: {
 *         one: {
 *             run: controllers => controllers.count.add(1),
 *             transition: [ 'two' ],
 *         },
 *         two: {
 *             run: controllers => controllers.count.add(1),
 *         },
 *     },
 * };
 */

/*
 * describe('buildTransitions', () => {
 *     it('runs simple machine when executed', () => {
 *         const transitions = buildTransitions<MockControllers>({
 *             run: controllers => controllers.count.add(1),
 *         });
 */

//         const controllers: MockControllers = {} as any;

//         expect(controllers.count.getFor()).to.equals(0);

//         advance(controllers, transitions);

/*
 *         expect(controllers.count.getFor()).to.equals(1);
 *     });
 */

/*
 *     it('runs inner machine when executed', () => {
 *         const transitions = buildTransitions<MockControllers>({
 *             run: simpleMachine,
 *         });
 */

//         const controllers: MockControllers = {} as any;

//         expect(controllers.count.getFor()).to.equals(0);

//         advance(controllers, transitions);

//         expect(controllers.count.getFor()).to.equals(1);

//         advance(controllers, transitions);

/*
 *         expect(controllers.count.getFor()).to.equals(3);
 *     });
 * });
 */

// prevent loops, prevent unused states
