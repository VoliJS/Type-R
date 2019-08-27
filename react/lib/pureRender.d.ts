import { ComponentType } from 'react';
import { InferAttrs } from '@type-r/models';
export declare function pureRenderProps<T extends object>(props: T, Comp: ComponentType<InferAttrs<T>>): ComponentType<InferAttrs<T>>;
