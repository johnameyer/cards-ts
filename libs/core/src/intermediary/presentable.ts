import { Card } from '../cards/card.js';
import { FourCardRun } from '../cards/four-card-run.js';
import { Meld } from '../cards/meld.js';
import { Rank } from '../cards/rank.js';
import { Suit } from '../cards/suit.js';
import { ThreeCardSet } from '../cards/three-card-set.js';

/**
 * Things the library knows how to write out as a human-readable string
 */
export type Presentable = Card | Rank | Suit | Meld | ThreeCardSet | FourCardRun | string | number | boolean | Presentable[];
