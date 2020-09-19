let count = -1;

/**
 * Class / Enum representing the possible suits in a deck
 */
export class Suit {
    public readonly type = 'suit';

    /**
     * Whether to use the symbol version when printing or the letter version
     */
    public static symbolic = false;
    /**
     * Suit used only for jokers
     */
    public static readonly NONE = new Suit('-', '-');
    public static readonly DIAMONDS: Suit = new Suit('♦', 'D');
    public static readonly CLUBS: Suit = new Suit('♣', 'C');
    public static readonly HEARTS: Suit = new Suit('♥', 'H');
    public static readonly SPADES: Suit = new Suit('♠', 'S');

    /**
     * The normal suits that appear in the deck
     */
    public static readonly suits: Suit[] = [Suit.DIAMONDS, Suit.CLUBS, Suit.HEARTS, Suit.SPADES];

    /**
     * Look up the suit from the letter
     * @param str the string to create from (expects the letter names)
     * @returns the corresponding suit
     * @example
     * fromString('d')
     * > Suit.DIAMONDS
     */
    public static fromString(str: string): Suit {
        const map: {[char: string]: Suit} = {
            D: Suit.DIAMONDS,
            C: Suit.CLUBS,
            H: Suit.HEARTS,
            S: Suit.SPADES,
        };
        return map[str.toUpperCase()];
    }

    /**
     * Look up a suit based on an object
     * Since the order field is an internal representation, this is not guaranteed to be stable between versions
     * @param obj the object to convert from
     * @returns the corresponding suit
     */
    public static fromObj(obj: any) {
        if(obj.letter === '-') {
            return Suit.NONE;
        }
        return Suit.suits[obj.order];
    }

    /**
     * Compares two suits for the purposes of sorting
     * @param one the first suit
     * @param two the second suit
     */
    public static compare(one: Suit, two: Suit): number {
        return one.order - two.order;
    }

    /**
     * The internal ordering of this suit
     */
    private readonly order: number;

    private constructor(public readonly symbol: string, public readonly letter: string) {
        this.order = count++;
        Object.freeze(this);
    }

    /**
     * Returns the string representation of this
     */
    public toString(): string {
        if (Suit.symbolic) {
            return this.symbol;
        } else {
            return this.letter;
        }
    }
}
