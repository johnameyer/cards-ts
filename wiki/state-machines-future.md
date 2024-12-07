---
title: State Machine Roadmap
---

# State Machine Roadmap

In v1 we enabled creation of state machines, added basic utility functions to manipulate and execute, and a smattering of abstractions for handlers and loops and the like.

## V2 Items

All controllers work should likely wait until the event handling is also handled by the tree.

Remove GameStates typing

### Scoped Controllers

Today, the lifecycle of controllers must be handled manually. They are initialized with a certain state through the providers, and then often need resetting or otherwise updated at a cadence. Common examples are decks, hands, points, and (turn) counters.


An initial example would likely be to simply accept the controllers as a variable where it makes sense.
```ts
game({
  using: controllers => {points: controllers.points},
  core: loop({
    resetting: controllers => {deck: controllers.deck},
    incrementing: controllers => {counter: controllers.counter}
  })
});
```

Longer term, the `buildProviders` method can be removed entirely and providers initialized where they make sense. We might actually make the type checking stricter by doing so: instead of passing the controllers type around, it would be inferred based on the providers in the parent scope. This would also make it easier to hide managed controllers like waiting and game state. This might have a drawback when breaking up the machine into smaller portions using variables as there will then be more types needing defined concretely instead of through inference.

### Additional constructs

#### Game Types

These would handle winner / game over messages - maybe not the underlying round messaging.

```
pointsGame({
  // implicit using: points controller
  rounds,
  teamConfig?: ,
})
```

```
cardKeepingGame({ // e.g. war
  rounds,
  // implicit using: hands controller
})
```

```
moneyGame({}) // e.g. blackjack
```

#### Tricks

At what abstraction is this? Do we want to keep `pointsGame` separate?

New package.

```
tricksRound({
  // implicit leader, position, trick controllers
  leadCard: // e.g. 2C
  beforeEach: // e.g. passing / bidding
  followsTrick: // e.g. hearts no blood shed - though this is more of a validation item so may not live here initially
  trickTaker: // e.g. trump suit
  pointsCalculation: numTricks, numOfType
  participating // e.g. euchre going along
})
```

#### Play Card

This is v3 - handle messaging around a user playing a card.

### Stuck Machine Validation

Validate any missing nodes / faulty transitions

### Avoid bailouts / manual definition

War, Euchre

## V3 Items

#### Merging in validation

```
run: handleSingle({ // TODO better terminology
    handler: 'dealerDiscard',
    position: controllers => controllers.deck.dealer,
    process: { // new
      // might be an array of `on(Class, {})` depending on message type / factory work
      MessageType: {
        // implicit eventHandler canRespond isTurn / isWaiting based on this handler type
        // validators as usual
        // mergers as usual
        // transform will wait for the second part / not be needed with message builder classes / be shared across the message types
      }
    },
})
```

The new values are included on the resultant machine as a property which will be merged when the machine is flattened.

#### Generating handler types

When we have above in place, using the values propogated up then allows for extraction of the handler interface off of the event validation (rather than being a fake / synthetic property) i.e. `ExtractHandlerType<typeof machine>`. This also allows for identifiying the actually expected response types for that event type.

The question then becomes of what to do with conflicts in definitions.

There is also a question of how to determine the status messages the machine will produce (with conditionals like hand dealOut)

(Note - dynamic controller deps - i.e. deck vs hand)
