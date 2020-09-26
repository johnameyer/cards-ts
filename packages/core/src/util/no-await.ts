export function noAwait<T>(x: Promise<T>){
    return Promise.race([x, new Promise(resolve => setTimeout(resolve, 0))]);
}