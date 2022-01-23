import { GameHandler, HandlerData } from '../game-handler';
import { ResponseMessage } from '../messages/response-message';
import { compare } from '../util/compare';
import { PassResponseMessage } from '../messages/response';
import { Card, HandlerResponsesQueue, PlayCardResponseMessage } from '@cards-ts/core';
import { Message } from '@cards-ts/core';
import { Suit } from '@cards-ts/core';
import { Rank } from '@cards-ts/core';
import { Intermediary } from '@cards-ts/core';

const QS = new Card(Suit.SPADES, Rank.QUEEN);

const toInquirerValue = <T extends {toString: () => string}>(t: T) => ({
    name: t.toString(),
    value: t,
});

export class IntermediaryHandler extends GameHandler {
    constructor(private intermediary: Intermediary) {
        super();
    }

    handlePass = ({ hand, params: { numToPass }}: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>) => {
        const [ sent, received ] = this.intermediary.form({
            type: 'checkbox',
            message: [ 'Select the cards to pass' ],
            choices: hand.sort(compare).map(toInquirerValue),
            // @ts-ignore
            validate: validatePass,
            validateParam: { numToPass },
        });
        responsesQueue.push(received.then(results => new PassResponseMessage(results[0] as Card[])));
        return sent;
    }

    handleTurn = ({ hand, trick: { tricks, currentTrick }, trickPoints: pointsTaken }: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>) => {
        let choices = hand;
        if(currentTrick.length > 0) {
            if(choices.some(card => card.suit === (currentTrick[0] as Card).suit)) {
                choices = choices.filter(card => card.suit === (currentTrick[0] as Card).suit);
            } else if(tricks === 0) {
                choices = choices.filter(card => card.suit !== Suit.HEARTS && !card.equals(QS));
            }
        } else if(pointsTaken.every(points => points === 0)) {
            choices = choices.filter(card => card.suit !== Suit.HEARTS);
        }
        const [ sent, received ] = this.intermediary.form({
            type: 'list',
            message: [ 'Select the card to play' ],
            choices: choices.sort(compare).map(toInquirerValue),
        });
        responsesQueue.push(received.then(received => new PlayCardResponseMessage(received[0] as Card)));
        return sent;
    }

    message(_handlerData: HandlerData, _responsesQueue: HandlerResponsesQueue<ResponseMessage>, message: Message) {
        const [ sent ] = this.intermediary.print(...message.components);
        return sent;
    }

    waitingFor(_handlerData: HandlerData, _responsesQueue: HandlerResponsesQueue<ResponseMessage>, _who: string[] | undefined) {
        // TODO this.intermediary
        return;
    }
}

function validatePass(cards: Card[], { numToPass }: { numToPass: number }) {
    return cards.length === numToPass ? true : 'Need to pass ' + numToPass + ' cards';
}
