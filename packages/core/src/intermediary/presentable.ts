import { Card } from '../cards/card';
import { FourCardRun } from '../cards/four-card-run';
import { Rank } from '../cards/rank';
import { Suit } from '../cards/suit';
import { ThreeCardSet } from '../cards/three-card-set';

export type Presentable = Card | Rank | Suit | ThreeCardSet | FourCardRun | string | number | boolean | Presentable[];
