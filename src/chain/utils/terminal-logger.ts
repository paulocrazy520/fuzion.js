import {Formatter} from "../../core/utils/formatter";

export class TerminalLogger {
    private static _loggerOn = false

    static get enabled():boolean {
        return this._loggerOn
    }

    static set enabled(enabled:boolean) {
        this._loggerOn = enabled
    }

    public static log = (msg?:any, prefix='Fuzion.js:') => {
        if(this._loggerOn){
            console.log(`${prefix} ${msg}`)
        }
    }

    public static logPrettyJson = (object?:any, prefix='Fuzion.js:') => {
        if(this._loggerOn){
            console.log(`${prefix}\r\n${Formatter.getPrettyJson(object)}`)
        }
    }

    public static time = (msg?:any, prefix='Fuzion.js:') => {
        if(this._loggerOn){
            console.time(`${prefix} ${msg}`)
        }
    }

    public static timeEnd = (msg?:any, prefix='Fuzion.js:') => {
        if(this._loggerOn){
            console.timeEnd(`${prefix} ${msg}`)
        }
    }

    public static newLine = () => {
        if(this._loggerOn){
            console.log(``)
        }
    }
}