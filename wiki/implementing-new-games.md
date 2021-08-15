# Implementing a New (Card) Game

(Reference @cards-ts/war for an implementation of a very simple card game)

## Card Game Requirements

To implement a new card game as of v0.6.0, you need to implement the main abstract classes in @cards-ts/core/games for your game and some other files as well:

- `event-handler-interface` as `event-handler`
  - the class that handles validating and merging in responses from the handlers
- `abstract-game-factory` as `game-factory`
  - the class that bundles together all of your custom game logic to present a unified interface for consumers
- `generic-game-setup` as `game-setup`
  - the class that allows you to customize the game params and gives information about the params
- `generic-game-state-transitions` as `game-state-transitions`
  - the class that manages transitioning from game state to game state (similar to a finite state machine)
- `game-handler-params`
  - spells out what custom events the game might send to handlers and any special params (if not contained in the state)
- `game-handler`
  - describes what events are expected in response to the events
- `game-params`
  - an plain object interface describing possible variations upon the game
- `game-states`
  - describes all the custom states this game might enter as a const object enum
- `controllers/controllers`
  - describes the shape of the state for your game

You will then also need to provide any additional custom message types, custom controllers, and at least one bot handler and intermediary handler.

## Typical Process

The very first thing to do is to think about what game your desired card game is most like, and then just directly copy the files from that card game package (in lieu of a template package) and then tear out any logic that isn't needed.

A good place to always begin is with identifying ther user inputs into the game (i.e. will the user be prompted to discard a card? to play a meld or just a single card?), which then informs your `game-handler`, `game-handler-params`, and response messages. Start out with a clear `game-params` and `game-setup`, since you can customize ways to play your game later.

Think about the states your game goes through and then put together a start to your `game-states` and then think about what state/controllers you will need, giving you a first start on your custom controllers and `controllers/controllers`.

Once you've generally settled on your custom events and state, you can start to put together your `event-handler` to validate and respond to events, and your bot and intermediary handlers to respond to events (typically starting with a very basic valid response for bots).

At this point, you should be good to start on your `game-state-transitions` and implement the transitions between each of your states. You should also be able to wire up the factory at this point and be able to incrementally run and test your game.

Once the basic game is in place, enhance the params, bot handler, or any other part of the game! Add it to `games.txt` and make sure it passes the basic package test which verifies the game finishes as well.

(Note that library major version changes are planned to be owned by the library maintainer)