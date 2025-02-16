/**
 * @module
 * 
 * @categoryDescription Controller
 * {@include ../../../wiki/glossary.md#controller}
 * 
 * @categoryDescription Controller Provider
 * {@include ../../../wiki/glossary.md#provider}
 * 
 * @categoryDescription Core
 * 
 * @categoryDescription Game Builder
 * Allows for implementing a new game type.
 * 
 * See [Creating a New Game](../../../wiki/implementing-new-games.md)
 * 
 * @categoryDescription Handler
 * {@include ../../../wiki/glossary.md#handler}
 * 
 * @categoryDescription Message
 * {@include ../../../wiki/glossary.md#message}
 */

// TODO Should the handler interface just completely keyed off of messages - i.e. instead of a function call could the game state send an 'input' message.
export * from './browser-index.js';

export { InquirerPresenter } from './intermediary/inquirer-presenter.js';
