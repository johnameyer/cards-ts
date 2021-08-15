# Cards-TS Dictionary

## High Level Concepts

### Controller

A controller is a class that is initialized at state load time that wraps a slice of the state and has complete control over that state. For example, the hands controller has control over the cards found in each player's hand. Controllers can also have dependencies on other controllers by name, like the deck controller does for the hand controller, which allows them to have more advanced or sophisticated functionality that helps to reduce verbosity in the game transitions for shared functionality (e.g. dealing out cards to hands). We provide the handler controller as a potential dependency so controllers can have a rich control over the flow of game, and long term we wish to push as much to a shared state as possible... as far as implementing whole flows, their transitions, and event handling through controllers or a different shared interface. Controllers are responsible for initializing, modifying, and validating their state and transforming it for the handlers (i.e. hiding data that isn't to be known).

Each game can create custom controllers for very specialized functionality, or contribute upstream to the main package to add those controllers if they are fairly common.

### Game

A game is an package (when in this library), as well as an implementation of the core game classes for specific card game or family of card games (played with similar rules).

### Handler

A handler is the interface by which a player (or bot) reacts to various events. There are the SystemHandler events, allowing for reacting to generic status messages and whoever the game is currently waiting on, and also whatever events are defined by the individual games (like prompting for a discard or a bid), which allow the handler to respond with proper response messages that mutate the state. Handler instances are joined in a handler chain, which allows for more shared functionality by only implementing a few of all the needed handlers.

### Intermediary

An intermediary is a bridge between handlers and presenters, or in other words sits on top of the presenters and provides the logic that differentiates a platform where multiple UI elements can be shown at once (like a web browser) or one at a time (like the console/inquirer.js). This is honestly a spot in need of improvement for the future.

### Message

A message is a serializable element of communication, which takes two flavors: status/game-generated events which inform handlers about what has changed in the game state, as well as response/handler-generated events which tell the game that a handler would like to respond to something (like an opportunity to bid, discard, or play a card). A presentable should contain a message that can be displayed to an end user, as well as any other data that may be helpful for a bot to process the event without parsing the message.

### Presenter

A presenter defines how each of the individual presentation elements ("presentables" like a selection from a list or just a plain message) should be rendered for a user and how the user's response is returned.