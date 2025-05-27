# @cards-ts/state-machine

## 0.8.1

### Patch Changes

- Updated dependencies [[`3fe2a5b`](https://github.com/johnameyer/cards-ts/commit/3fe2a5b96fe81618e01573ed946fda0cfc76ee11)]:
  - @cards-ts/core@0.8.1

## 0.8.0

### Minor Changes

- Add generic state machine composition structures and execution as well as initial set of machine factory functions for common use cases. Adds `sequence`, `conditionalState`, and `loop` for generic state wiring and the functions `handleSingle`, `handleAll`, `handleRoundRobin`, and `handleRoundRobinFirst` to cover most handler-calling use cases.
