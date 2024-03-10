import { Context, Schema } from 'koishi';
export declare const name = "checkin-pstr";
declare module 'koishi' {
    interface Tables {
        checkinPstrValue: CheckinPstrValue;
    }
    interface CheckinPstrValue {
        key: string;
        value: string;
    }
}
export interface Config {
}
export declare const Config: Schema<Config>;
export declare function apply(ctx: Context): void;
