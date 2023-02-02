export class Formatter {
    public static getPrettyJson(object: any): string {
        return JSON.stringify(object, null, 2)
    }
}