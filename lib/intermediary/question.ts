// CREATE builder class
// e.g. Builder.addText('Round is').addText('It is your turn').setQuestion('Do you want card').setResponseMessage('You picked it up');

// export interface ListQuestion<T> {
//     type: 'list'; // list checkbox
//     message: string;
//     choices: T[];
// }

// export interface ChoicesQuestion<T> {
//     type: 'checkbox';
//     message: string;
//     choices: T[];
//     validate: (answers: T) => boolean | string | Promise<boolean | string>;
// }

// export interface ConfirmQuestion {
//     type: 'confirm';
//     message: string;
// }

// export interface InputQuestion {
//     type: 'input';
//     message: string;
// }

// export type Question<T> = ListQuestion<T> | ChoicesQuestion<T> | ConfirmQuestion | InputQuestion;

// export namespace Question {
//     export class ListBuilder<T> {
//         private message = '';

//         constructor(private choices: T[]) { }

//         appendText(text: string) {
//             this.message += '\n' + text;
//             return this;
//         }
        
//         toQuestion(): ListQuestion<T> {
//             return {
//                 type: 'list',
//                 message: this.message,
//                 choices: this.choices
//             };
//         }
//     }

//     export class ChoicesBuilder<T> {
//         constructor() {

//         }

//         addValidator(validator: ChoicesQuestion<T>['validate']) {
//             return this;
//         }

        
//         toQuestion(): ChoicesQuestion
//         <T> {
//             return {...this};
//         }
//     }
// }