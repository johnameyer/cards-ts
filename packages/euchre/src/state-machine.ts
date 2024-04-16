import { loop, sequence, } from '@cards-ts/core';
import { Controllers } from './controllers/controllers.js';


// const stateMachine = sequence<Controllers>([
//     { // TODO how does this outer level look?
//     //   id: 'start-game',
//       run: controllers => { /* start game - state should already be clean so no-op */ },
//     },
//     loop({
//       id: 'round',
//       beforeEach: controllers => { /* clean up state */ },
//       afterAll: controllers => { /* update scores and send messages */ },
//       condition: controllers => /* no player has yet won */,
//       run: sequence([
//         handleRoundRobin({
//           id: 'order-up', // these can probably be left off for the handler arg if we handle collisions
//           mode: 'round-robin',
//           // TODO should we have different functions for different modes or will discriminated union work fine?
//           handler: 'orderUp',
//           startingPosition: controllers => controllers.deck.dealer,
//           beforeAll: controllers => { /* message about flipped card */ },
//           // TODO ponder about semantics between outer beforeEach and inner beforeAll
//           afterEach: controllers => { /* message (incl. going along) */ },
//           breakingIf: controllers => controllers.euchre.bidder !== undefined,
//           afterBreak: handle({ // TODO better terminology
//             mode: 'single',
//             handler: 'dealerDiscard',
//             position: controllers => controllers.deck.dealer,
//             after: controllers => { /* take the discard and give new card */ }, // plays into #116 
//           }),
//           otherwise: handle({ // TODO better terminology
//             mode: 'round-robin',
//             handler: 'nameTrump',
//             startingPosition: controllers => controllers.deck.dealer,
//             breakingIf: controllers => controllers.euchre.bidder !== undefined,
//             afterBreak: controllers => { /* message (incl. going along) */ }
//             // TODO handle misdeal / no trump selected - likely need to wrap in a loop
//           }),
//         }),
//         loop({
//           id: 'trick',
//           beforeEach: controllers => { /* send messages, reset states */ },
//           afterEach: controllers => { /* message, update leader, update count */ },
//           condition: controllers => /* players have cards */,
//           run: handle({
//             mode: 'round-robin',
//             handler: 'turn',
//             startingPosition: controllers => controllers.trick.leader,
//             condition: controllers => isPlayingThisRound(controllers.turn.get(), controllers)
//             after: controllers => { /* send message (setting state currently handled by event-handler merge */ }
//           })
//         }),
//       ]),
//     }),
//     {
//       id: 'end-game',
//       run: () => { /* send game over message */ },
//     },
//   ]);