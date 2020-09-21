export interface GameParams {
    maxScore: number;

    numToPass: number;

    quickEnd: boolean;
}

export const defaultParams = {
    maxScore: 50,
    numToPass: 3,
    quickEnd: true,
}