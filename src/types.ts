import type { AnyBase } from './Base';
import type Lazy from './Lazy';

export type SchemaLike = AnyBase | Lazy<AnyBase>;

export type Callback<T = any> = (err: Error | null, value?: T) => void;

export type TransformFunction<T extends AnyBase> = (
  this: T,
  value: any,
  originalValue: any,
) => any;

export interface ValidateOptions {
  /**
   * Only validate the input, and skip and coercion or transformation. Default - false
   */
  strict?: boolean;
  /**
   * Return from validation methods on the first error rather than after all validations run. Default - true
   */
  abortEarly?: boolean;
  /**
   * Remove unspecified keys from objects. Default - false
   */
  stripUnknown?: boolean;
  /**
   * When false validations will not descend into nested schema (relevant for objects or arrays). Default - true
   */
  recursive?: boolean;
  /**
   * Any context needed for validating schema conditions (see: when())
   */
  context?: object;
}

export interface InternalOptions extends ValidateOptions {
  __validating?: boolean;
  originalValue?: any;
  parent?: any;
  path?: string;
  sync?: boolean;
  from?: { schema: AnyBase; value: any }[];
}

export interface MessageParams {
  path: string;
  value: any;
  originalValue: any;
  label: string;
  type: string;
}

export type Message<Extra extends Record<string, unknown> = {}> =
  | string
  | ((params: Extra & MessageParams) => unknown)
  | Record<PropertyKey, unknown>;

export type ExtraParams = Record<string, unknown>;

export type AnyMessageParams = MessageParams & ExtraParams;

export type Maybe<T> = T | null | undefined;

export type Preserve<T, U> = T extends U ? U : never;

export type PreserveOptionals<T> = Preserve<T, null> | Preserve<T, undefined>;