import { GameDriver, LocalMaximumHandler, defaultParams } from '../lib';

const driver = new GameDriver([new LocalMaximumHandler(50), new LocalMaximumHandler(50)], defaultParams);
driver.start().then(() => process.exit(0)).catch((e) => {
    console.log(e);
    process.exit(1);
});
setTimeout(() => {
    console.log('Timed out');
    process.exit(2);
}, 200000)