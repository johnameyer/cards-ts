# @cards-ts/core

## 0.7.0

### Minor Changes

- [#109](https://github.com/johnameyer/cards-ts/pull/109) [`2510048`](https://github.com/johnameyer/cards-ts/commit/2510048dd8cce64423811aafe507d6bd1cac095f) Thanks [@johnameyer](https://github.com/johnameyer)! - Migrate to ESM modules and bump dependencies

- [#126](https://github.com/johnameyer/cards-ts/pull/126) [`15e700c`](https://github.com/johnameyer/cards-ts/commit/15e700ce546250893b7fd4daf31d3cc88e2d7716) Thanks [@johnameyer](https://github.com/johnameyer)! - Introduce `buildEventHandler` function to wrap event handler functions and allow for creating smaller, more declarable and reusable event validators and mergers. Export several helper functions off of `EventHandler` to encapsulate common use cases.

- [#115](https://github.com/johnameyer/cards-ts/pull/115) [`4e06947`](https://github.com/johnameyer/cards-ts/commit/4e06947f556c74f7d544aaddd6719e562adce3de) Thanks [@johnameyer](https://github.com/johnameyer)! - Change signature of game state transitions to allow for less verbosity and duplication

- [#126](https://github.com/johnameyer/cards-ts/pull/126) [`15e700c`](https://github.com/johnameyer/cards-ts/commit/15e700ce546250893b7fd4daf31d3cc88e2d7716) Thanks [@johnameyer](https://github.com/johnameyer)! - Remove need to include data in every response class and instead handle generically across all games using `buildEventHandler` wrapper function.

### Patch Changes

- [#111](https://github.com/johnameyer/cards-ts/pull/111) [`6464b83`](https://github.com/johnameyer/cards-ts/commit/6464b83bc5e49028f1cc26adf344419bd4c3ced0) Thanks [@johnameyer](https://github.com/johnameyer)! - Default tricks controller to follow suit when selecting winner

- [#111](https://github.com/johnameyer/cards-ts/pull/111) [`6464b83`](https://github.com/johnameyer/cards-ts/commit/6464b83bc5e49028f1cc26adf344419bd4c3ced0) Thanks [@johnameyer](https://github.com/johnameyer)! - Minor improvement to CLI card listing
