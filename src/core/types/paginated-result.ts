/**
 * A generic type to conveniently wrap paginated results from functions that implement paging.
 * You can set the next_key property with a value that your paging mechanism can use to
 * determine where to continue from on the next call.
 */

export type PaginatedResult<ResultType> = {
    data: ResultType,
    pagination: Pagination
}

export type Pagination = {
    next_key:any,
    total: number
}