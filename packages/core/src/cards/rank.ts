let count = 0;

/**
 * A class for the rank of a card like 'TWO' or 'KING'
 */
export class Rank {
    public readonly type = 'rank';

    public static readonly JOKER: Rank	= new Rank('*', 50);

    public static readonly TWO: Rank	= new Rank('2', 20);

    public static readonly THREE: Rank	= new Rank('3', 5);

    public static readonly FOUR: Rank	= new Rank('4', 5);

    public static readonly FIVE: Rank	= new Rank('5', 5);

    public static readonly SIX: Rank	= new Rank('6', 5);

    public static readonly SEVEN: Rank	= new Rank('7', 5);

    public static readonly EIGHT: Rank	= new Rank('8', 5);

    public static readonly NINE: Rank	= new Rank('9', 5);

    public static readonly TEN: Rank	= new Rank('10', 10);

    public static readonly JACK: Rank	= new Rank('J', 10);

    public static readonly QUEEN: Rank	= new Rank('Q', 10);

    public static readonly KING: Rank	= new Rank('K', 10);

    public static readonly ACE: Rank	= new Rank('A', 15);

    /**
     * All of the ranks that are possible for cards
     */
    public static readonly ranks: Rank[] = Object.values(Rank).filter((item) => item instanceof Rank);

    /**
     * Returns the ranks that are wild
     * @returns an array of the wild ranks
     */
    public static wildcards(): Rank[] {
        return [ Rank.JOKER, Rank.TWO ];
    }

    /**
     * Tells if two ranks are next to each other
     * @returns if the ranks are next to each other
     */
    public static contiguous(one: Rank, two: Rank) {
        return Math.abs(one.order - two.order) === 1;
    }

    /**
     * Tells how far apart two ranks are based on the inner value of the ranks
     * Note that jokers and twos are accepted by the function but the result is not defined
     * @see Rank.difference
     * @param one the first rank
     * @param two the second rank
     * @returns the unsigned (abs) distance between the ranks
     * @example
     * distance(JACK, KING)
     * > 2
     */
    public static distance(one: Rank, two: Rank) {
        return Math.abs(one.order - two.order);
    }

    /**
     * Tells how far apart two ranks are based on the inner values
     * Note that jokers and twos are accepted by the function but the result is not defined
     * @see Rank.distance
     * @param one the first rank
     * @param two the second rank
     * @returns the signed difference between the ranks
     * @example
     * difference(JACK, KING)
     * > 2
     */
    public static difference(one: Rank, two: Rank) {
        return one.order - two.order;
    }

    /**
     * Looks up a rank based on a string version
     * @param str the string to lookup
     * @returns the corresponding rank
     */
    public static fromString(str: string): Rank {
        const map: {[char: string]: Rank} = {
            '*': Rank.JOKER,
            2: Rank.TWO,
            3: Rank.THREE,
            4: Rank.FOUR,
            5: Rank.FIVE,
            6: Rank.SIX,
            7: Rank.SEVEN,
            8: Rank.EIGHT,
            9: Rank.NINE,
            10: Rank.TEN,
            J: Rank.JACK,
            Q: Rank.QUEEN,
            K: Rank.KING,
            A: Rank.ACE,
        };
        return map[str.toUpperCase()];
    }

    /**
     * Looks up a rank based on an object
     * Since the order field is an internal representation, this is not guaranteed to be stable between versions
     * @param obj the object to convert from
     * @returns the corresponding rank
     */
    public static fromObj(obj: any) {
        return Rank.ranks[obj.order];
    }

    /**
     * Compares two ranks for the purposes of sorting
     * @param one the first rank
     * @param two the second rank
     */
    public static compare(one: Rank, two: Rank): number {
        return one.order - two.order;
    }

    /**
     * The internal ordering of this rank
     */
    public readonly order: number;

    // TODO remove value
    private constructor(readonly char: string, readonly value: number) {
        this.order = count++;
        Object.freeze(this);
    }

    /**
     * Tells if two ranks are next to each other
     * @returns if the ranks are next to each other
     */
    public contiguous(one: Rank) {
        return Math.abs(one.order - this.order) === 1;
    }


    /**
     * Tells how far apart two ranks are based on the inner value of the ranks
     * Note that jokers and twos are accepted by the function but the result is not defined
     * @see Rank.difference
     * @param other the other rank
     * @returns the unsigned (abs) distance between the ranks
     * @example
     * KING.distance(JACK)
     * > 2
     */
    public distance(other: Rank) {
        return Math.abs(other.order - this.order);
    }

    /**
     * Tells how far apart two ranks are based on the inner values
     * 
     * Note that jokers and twos are accepted by the function but the result is not defined
     * @see Rank.distance
     * @param other the other rank
     * @returns the signed difference between the ranks
     * @example
     * KING.difference(JACK)
     * > -2
     */
    public difference(other: Rank) {
        return other.order - this.order;
    }

    // TODO remove
    /**
     * Tells whether a rank is wild or not
     * @returns if it is wild
     */
    public isWild(): boolean {
        return this === Rank.JOKER || this === Rank.TWO;
    }

    /**
     * Gets the rank that is above or below this one by a certain amount
     * @param i how much to displace this rank by
     * @returns the displaced rank
     */
    public displace(i: number): Rank {
        return Rank.ranks[this.order + i];
    }

    /**
     * Returns the string representation of this
     */
    public toString(): string {
        return this.char;
    }
}
