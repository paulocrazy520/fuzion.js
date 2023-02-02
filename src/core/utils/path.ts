export class Path {

    public static join = (start: string, end: string) => {
        if (!start.endsWith('/')) {
            start = start + '/'
        }

        return start + end
    }
}