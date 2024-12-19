---
title: Glossary
---

# Cards-TS Glossary

## Controller

A controller is a class {@link @cards-ts/core!AbstractController | extending AbstractController} that is initialized at state load time that wraps a slice of the state and has complete control over that state. For example, the {@link @cards-ts/core!HandsController | HandsController} has control over the cards found in each player's hand. Controllers can also define dependencies on other controllers, as the {@link @cards-ts/core!DeckController | DeckController} does for the {@link @cards-ts/core!HandsController | HandsController}, which allows them to have more advanced or sophisticated functionality that helps to reduce verbosity in the game transitions for shared functionality (e.g. dealing out cards to hands). Controllers are responsible for modifying (through user defined functions) and {@link @cards-ts/core!AbstractController.validate | validating} their underlying state and {@link @cards-ts/core!AbstractController.getFor | transforming it for the handlers} (i.e. hiding data that isn't to be known).

Each game can create custom controllers for very specialized functionality, or contribute upstream to the main package to add those controllers if they are fairly common.

## Provider

Every controller has an associated provider which defines the {@link @cards-ts/core!GenericControllerProvider.dependencies | dependent controllers} and handles the {@link @cards-ts/core!GenericControllerProvider.initialState | initialization of the state} and {@link @cards-ts/core!GenericControllerProvider.controller | construction of the controller object}.

## Handler

A handler is the interface by which a player (or bot) reacts to various events. There are the {@link @cards-ts/core!SystemHandler | SystemHandler} events, allowing for reacting to generic status messages and whoever the game is currently waiting on, and also whatever events are defined by the individual games (like prompting for a discard or a bid), which allow the handler to respond with proper response messages that mutate the state. Handler instances are joined in a {@link @cards-ts/core!HandlerChain | HandlerChain}, which allows for more shared functionality by only implementing a few of all the needed handlers.

## Message

A {@link @cards-ts/core!Message:class | Message} is a serializable element of communication, which takes two flavors: status/game-generated events which inform handlers about what has changed in the game state, as well as response/handler-generated events which tell the game that a handler would like to respond to something (like an opportunity to bid, discard, or play a card). A {@link @cards-ts/core!Presentable | Presentable } should contain a message that can be displayed to an end user, as well as any other data that may be helpful for a bot to process the event without parsing the message.

## Game

A game is an package (when in this library), as well as an implementation of the core game classes for specific card game or family of card games (played with similar rules).

## Presenter

A {@link @cards-ts/core!Presenter | Presenter} defines how each of the individual presentation elements ("presentables" like a selection from a list or just a plain message) should be rendered for a user and how the user's response is returned.

## Intermediary

An {@link @cards-ts/core!Intermediary:interface | Intermediary} is a bridge between handlers and presenters, or in other words sits on top of the presenters and provides the logic that differentiates a platform where multiple UI elements can be shown at once (like a web browser) or one at a time (like the console/inquirer.js). This is honestly a spot in need of improvement for the future.