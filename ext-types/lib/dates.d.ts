import { DateType, ChainableAttributeSpec } from '@type-r/models';
export declare class MicrosoftDateType extends DateType {
    convert(next: any): any;
    toJSON(value: any): string;
}
export declare const MicrosoftDate: ChainableAttributeSpec<Function>;
export declare const Timestamp: ChainableAttributeSpec<DateConstructor>;
