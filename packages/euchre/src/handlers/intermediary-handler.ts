import { GameHandler, HandlerData } from '../game-handler';
import { OrderUpResponseMessage, NameTrumpResponseMessage, DealerDiscardResponseMessage, GoingAloneResponseMessage } from '../messages/response';
import { ResponseMessage } from '../messages/response-message';
import { compare } from '../util/compare';
import { followsTrick } from '../util/follows-trick';
import { Intermediary } from '@cards-ts/core';
import { Suit } from '@cards-ts/core';
import { Message } from '@cards-ts/core';
import { Card, HandlerResponsesQueue, PlayCardResponseMessage } from '@cards-ts/core';

const toInquirerValue = <T extends {toString: () => string}>(t: T) => ({
    name: t.toString(),
    value: t,
});

export class IntermediaryHandler extends GameHandler {
    constructor(private intermediary: Intermediary) {
        super();
    }

    handleOrderUp = ({ euchre: { currentTrump }}: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>) => {
        const [ sent, knocked ] = this.intermediary.form({
            type: 'confirm',
            message: [ 'Would you like to bid on', currentTrump, '?' ],
        });
        const goAlone = knocked.then(([ knock ]) => {
            // TODO this would need to be refactored if we enable host side intermediary handlers, since the 'sent' is conditional
            if(knock) {
                const [ _, received ] = this.intermediary.form({
                    type: 'confirm',
                    message: [ 'Would you like to go alone?' ],
                });
                return received;
            } 
            return undefined;
            
        });
        responsesQueue.push(knocked.then(results => new OrderUpResponseMessage(results[0])));
        responsesQueue.push(goAlone.then(results => results && results[0] ? new GoingAloneResponseMessage() : undefined));
        return sent;
    };

    handleNameTrump = ({ euchre: { currentTrump }}: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>) => {
        const [ sent, trump ] = this.intermediary.form({
            type: 'list',
            message: [ 'Select your desired trump suit' ],
            choices: [ ...Suit.suits.filter(suit => suit !== currentTrump).map(toInquirerValue), { name: 'Pass', value: undefined }],
        });
        const goAlone = trump.then(([ knock ]) => {
            // TODO this would need to be refactored if we enable host side intermediary handlers, since the 'sent' is conditional
            if(knock) {
                const [ _, received ] = this.intermediary.form({
                    type: 'confirm',
                    message: [ 'Would you like to go alone?' ],
                });
                return received;
            } 
            return undefined;
            
        });
        responsesQueue.push(trump.then(results => new NameTrumpResponseMessage(results[0] as Suit | undefined)));
        responsesQueue.push(goAlone.then(results => results && results[0] ? new GoingAloneResponseMessage() : undefined));
        return sent;
    };

    
    handleDealerDiscard = ({ hand }: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>) => {
        const [ sent, received ] = this.intermediary.form({
            type: 'list',
            message: [ 'Select a card to discard' ],
            choices: hand.sort(compare).map(toInquirerValue),
        });
        responsesQueue.push(received.then(results => new DealerDiscardResponseMessage(results[0] as Card)));
        return sent;
    };

    handleTurn = ({ hand, trick: { currentTrick }, euchre: { currentTrump }}: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>) => {
        let choices = hand;
        if(currentTrick.length > 0) {
            const follows = choices.filter(card => followsTrick(currentTrick, currentTrump, card));
            if(follows.length) {
                choices = follows;
            }
        }
        const [ sent, received ] = this.intermediary.form({
            type: 'list',
            message: [ 'Select the card to play' ],
            choices: choices.sort(compare).map(toInquirerValue),
        });
        responsesQueue.push(received.then(received => new PlayCardResponseMessage(received[0] as Card)));
        return sent;
    };

    handleMessage(_handlerData: HandlerData, _responsesQueue: HandlerResponsesQueue<ResponseMessage>, message: Message) {
        const [ sent ] = this.intermediary.print(...message.components);
        return sent;
    }

    handleWaitingFor(_handlerData: HandlerData, _responsesQueue: HandlerResponsesQueue<ResponseMessage>, _who: string[] | undefined) {
        // TODO this.intermediary
        return;
    }
}
