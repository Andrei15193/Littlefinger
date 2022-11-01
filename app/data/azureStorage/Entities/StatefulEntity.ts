import type { TableEntity } from "@azure/data-tables";

export interface IStatefulEntity<TState> extends TableEntity {
    readonly state: TState;
    readonly warning?: string;
    readonly warningActivation?: Date;
}