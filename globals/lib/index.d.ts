import { Integer } from '@type-r/ext-types';
import { ChainableAttributeSpec } from '@type-r/models';
declare global {
    interface Function {
        value: (x: any) => ChainableAttributeSpec<any>;
        isRequired: ChainableAttributeSpec<any>;
        asProp: PropertyDecorator;
        has: ChainableAttributeSpec<any>;
    }
    interface DateConstructor {
        microsoft: ChainableAttributeSpec<this>;
        timestamp: ChainableAttributeSpec<this>;
    }
    interface Window {
        Integer: Function;
    }
    interface NumberConstructor {
        integer: typeof Integer;
    }
}
