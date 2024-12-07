/**
 * @module
 * @categoryDescription Controller
 * A controller is a class {@link @cards-ts/core!AbstractController | extending AbstractController} that is initialized at state load time that wraps a slice of the state and has complete control over that state.
 * @categoryDescription Controller Provider
 * @categoryDescription Core
 * @categoryDescription Game Builder
 * Allows for construction of a new game
 * @categoryDescription Handler
 * A {@link Handler} is a object that can listen and respond to predefined game events.
 * These events can be system events (status messages, waiting status) or interaction points defined by the game (i.e. asking a user for a response).
 * @categoryDescription Message
 * A message (which extends {@link !Message:class | Message}) is a serializable object that communicate about changes in the state of a game.
 * They come in two flavors: status messages (emitted by the game / state machine) and response messages (emitted by handlers).
 */

// TODO @include / [See Glossary] links
// TODO Should the handler interface just completely keyed off of messages - i.e. instead of a function call could the game state send an 'input' message.
export * from './browser-index.js';

export { InquirerPresenter } from './intermediary/inquirer-presenter.js';
