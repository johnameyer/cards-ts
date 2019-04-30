let count = 0;

export class Rank {
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

    public static readonly ranks: Rank[] = Object.values(Rank).filter((item) => item instanceof Rank);

    /**
     *  Returns a set of ranks that are wild
     */
    public static wildcards(): Rank[] {
        return [Rank.JOKER, Rank.TWO];
    }

    /**
     * Tells if two cards are next to each other
     */
    public static contiguous(one: Rank, two: Rank) {
        return Math.abs(one.order - two.order) === 1;
    }

    /**
     * Tells how far apart two cards are
     * @param one
     * @param two
     */
    public static distance(one: Rank, two: Rank) {
        return Math.abs(one.order - two.order);
    }

    public static fromString(str: string): Rank {
        const map: {[char: string]: Rank} = {
            '*': Rank.JOKER,
            '2': Rank.TWO,
            '3': Rank.THREE,
            '4': Rank.FOUR,
            '5': Rank.FIVE,
            '6': Rank.SIX,
            '7': Rank.SEVEN,
            '8': Rank.EIGHT,
            '9': Rank.NINE,
            '10': Rank.TEN,
            'J': Rank.JACK,
            'Q': Rank.QUEEN,
            'K': Rank.KING,
            'A': Rank.ACE,
        };
        return map[str.toUpperCase()];
    }

    public static compare(one: Rank, two: Rank): number {
        return one.order - two.order;
    }

    public readonly order: number;

    private constructor(private readonly char: string, readonly value: number) {
        this.order = count++;
    }

    /**
     * Tells if two cards are next to each other
     */
    public contiguous(one: Rank) {
        return Math.abs(one.order - this.order) === 1;
    }

    /**
     * Tells how far apart two cards are
     * @param one
     */
    public distance(one: Rank) {
        return Math.abs(one.order - this.order);
    }

    public isWild(): boolean {
        return this === Rank.JOKER || this === Rank.TWO;
    }

    public displace(i: number): Rank {
        return Rank.ranks[this.order + i];
    }

    public toString(): string {
        return this.char;
    }
}
