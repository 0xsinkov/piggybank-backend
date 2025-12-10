import { ResultAsync, errAsync, okAsync } from 'neverthrow';

export class Result<T> extends ResultAsync<T, T | Error> {
  public static async resultFromAsync<T>(
    value: PromiseLike<T>,
  ): Promise<ResultAsync<T, Error>> {
    return await ResultAsync.fromPromise(value, (e) => e as Error);
  }

  public static async okFrom<T>(value: T): Promise<Result<T>> {
    return okAsync(value);
  }

  public static async errFrom<T>(error: Error): Promise<Result<T>> {
    return errAsync(error);
  }
}
