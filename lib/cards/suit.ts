let count = 0;

export class Suit {

    public static symbolic = false;
    public static readonly NONE = new Suit('-', '-');
    public static readonly DIAMONDS = new Suit('♦', 'D');
    public static readonly CLUBS = new Suit('♣', 'C');
    public static readonly HEARTS = new Suit('♥', 'H');
    public static readonly SPADES = new Suit('♠', 'S');

    public static fromString(str: string): Suit {
        const map: {[char: string]: Suit} = {
            D: Suit.DIAMONDS,
            C: Suit.CLUBS,
            H: Suit.HEARTS,
            S: Suit.SPADES,
        };
        return map[str.toUpperCase()];
    }

    public static compare(one: Suit, two: Suit): number {
        return one.order - two.order;
    }
    public readonly order: number;

    private constructor(public readonly symbol: string, public readonly letter: string) {
        this.order = count++;
    }

    public toString(): string {
        if (Suit.symbolic) {
            return this.symbol;
        } else {
            return this.letter;
        }
    }
}
