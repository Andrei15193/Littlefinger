export interface ICurrenciesRepository {
    getAllAsync(): Promise<readonly string[]>;
}