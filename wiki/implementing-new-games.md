---
title: Creating a New Game
---

# Implementing a New (Card) Game

(Reference {@link "@cards-ts/war" | @cards-ts/war} for an implementation of a very simple card game)

## Typical Process

The very first thing is to think about if any of the existing card games are like your desired game, then just directly copy the files from that card game package and tear out any logic that isn't needed. If none are a particularly close match, War has by far the least amount of logic / oddness and so is a good scaffold.

Start by clearing out any parameters in `game-params` and `game-setup`, since you can customize ways to play your game later and this only introduces noise in the meantime.

Then identify the user inputs your game has (e.g. will the user be prompted to discard a card? or to play a single card or a meld?), and implement an initial version of your `game-handler-params`, `game-handler`, and response messages.

Think about the states and flow your game goes through and then put together a start to your `game-states`. While doing so, think about what state/controllers you will need, giving you a first start on your custom controllers and `controllers/controllers` file.

Once you've generally settled on your custom events and state, you can start to put together your `event-handler` to validate and respond to events, and your bot and intermediary handlers to respond to events (typically starting with a very basic valid response for bots).

At this point, you should be good to start on your `game-state-transitions` and implement the transitions between each of your states. Also at this point, you should be able to compile and be able to incrementally run and test your game.

Once the basic game is in place, you can enhance the params, bot handler, or any other part of the game! Add it to `games.txt` and make sure it passes the basic package test which verifies the game finishes as well.

(Note that library major version changes are planned to be owned by the library maintainer)

## Card Game Requirements

The following are files you'll generally need to modify in the course of creating your game.

- `event-handler` via calling {@link @cards-ts/core!buildEventHandler | buildEventHandler} or implementing {@link @cards-ts/core!EventHandlerInterface | EventHandlerInterface}
  - The class that handles validating and merging in responses from the handlers
  - [Hearts example](../packages/hearts/src/event-handler.ts)
- `buildProviders`
  - Allows for defining the shape of the data state of your game
- `game-states`
  - Describes all the custom states this game might enter as a const object enum
- `game-state-transitions` via implementing {@link @cards-ts/core!GenericGameStateTransitions | GenericGameStateTransitions}
  - The class that manages transitioning from game state to game state (similar to a finite state machine)
- `game-handler-params`
  - Spells out what custom events the game might send to handlers
- `game-handler` via implementing {@link @cards-ts/core!Handler | Handler}
  - Describes what events are expected in response to the events
- `game-factory` via calling {@link @cards-ts/core!buildGameFactory | buildGameFactory}
  - The class that bundles together all of your custom game logic to present a unified interface for consumers
  - You likely won't need to modify this from the default unless you have some customizations to the handlers (e.g. multiple bot handlers)
- `game-params`
  - A plain object interface describing possible variations upon the game
- `game-setup` via implementing {@link @cards-ts/core!GenericGameSetup | GenericGameSetup}
  - The class that allows you to customize the game params and gives information about the params

You will then also need to provide any additional custom message types, custom controllers, and at least one bot handler and intermediary handler.