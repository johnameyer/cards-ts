export function roundToString(round: readonly number[]) {
    const threes = round.filter(n => n === 3).length;
    const fours = round.filter(n => n === 4).length;
    if(threes && fours) {
        return ['This round is', threes, 'three-of-a-kind' + (threes > 1 ? 's': '') + ' and', fours, 'four-card-run' + (fours > 1 ? 's': '')];
    } else if(threes) {
        return ['This round is', threes, 'three-of-a-kind' + (threes > 1 ? 's': '')];
    } else {
        return ['This round is', fours, 'four-card-run' + (fours > 1 ? 's': '')];
    }
}