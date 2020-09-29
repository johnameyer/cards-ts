export const isDefined = function <T>(t: T | undefined | void): t is T {
    return t !== undefined;
};
