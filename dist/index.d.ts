import React from "react";
import { Draft } from "immer";

//#region src/formUtils.d.ts
type FieldState<T> = {
  value: T;
  error: string | undefined;
};
type FormSchema<Values> = { [K in keyof Values]: Values[K] extends object ? FormSchema<Values[K]> : FieldState<Values[K]> };
declare function field<T>(value: T): FieldState<T>;
//#endregion
//#region src/store.d.ts
type StateListener<T> = (state: T, prevState: T) => void;
type MetaListener = (meta: FormMeta, prevMeta: FormMeta) => void;
type SetState<T> = (fn: (state: T) => T) => void;
type GetState<T> = () => T;
type FormMeta = {
  isValid: boolean;
  isDirty: boolean;
};
type GetMeta = () => FormMeta;
type SetMeta = (fn: (meta: FormMeta) => FormMeta) => void;
interface MetaStore {
  getMeta: GetMeta;
  setMeta: SetMeta;
  subscribe: (listener: MetaListener) => () => void;
}
interface StoreApi<T> {
  getState: GetState<T>;
  setState: SetState<T>;
  subscribe: (listener: StateListener<T>) => () => void;
  getInitialState: () => T;
  meta: MetaStore;
  registerField: (field: any) => void;
  getRegisteredFields: () => any[];
}
//#endregion
//#region src/immer.d.ts
type SetStateWithImmer<T> = (fn: (draft: Draft<T>) => void) => void;
interface StoreApiWithImmer<T> extends Omit<StoreApi<T>, "setState"> {
  setState: SetStateWithImmer<T>;
}
//#endregion
//#region src/validators.d.ts
type Either<L, R> = {
  tag: "left";
  value: L;
} | {
  tag: "right";
  value: R;
};
declare const left: <L>(value: L) => Either<L, never>;
declare const right: <R>(value: R) => Either<never, R>;
declare const isLeft: <L, R>(e: Either<L, R>) => e is {
  tag: "left";
  value: L;
};
declare const isRight: <L, R>(e: Either<L, R>) => e is {
  tag: "right";
  value: R;
};
type Validator<T = string> = (value: T) => Promise<Either<string, T>>;
declare const required: (message: string) => Validator;
declare const minLength: (min: number, message: string) => Validator;
declare const maxLength: (max: number, message: string) => Validator;
declare const min: (minVal: number, message: string) => Validator;
declare const max: (maxVal: number, message: string) => Validator;
declare const pattern: (regex: RegExp, message: string) => Validator;
declare const emailPattern: (message: string) => Validator;
declare const pipe: (...validators: Validator[]) => Validator;
//#endregion
//#region src/react.d.ts
declare function useStore<T, U>(store: StoreApiWithImmer<T>, selector: (state: T) => U): U;
type FieldDescriptor<Value, T = any> = {
  select: (s: T) => FieldState<Value>;
  validate?: Validator<Value>;
};
declare function createField<Values extends object, Value = any>(config: {
  select: (s: FormSchema<Values>) => FieldState<Value>;
  validate?: Validator<Value>;
}): FieldDescriptor<Value, FormSchema<Values>>;
declare function updateFieldValue<Value, FormState = any>(store: StoreApiWithImmer<FormState>, field: FieldDescriptor<Value, FormState>, value: Value): void;
declare function useField<Value, FormState = any>(store: StoreApiWithImmer<FormState>, field: FieldDescriptor<Value, FormState>): {
  value: Value;
  error: string | undefined;
  setValue: (v: Value) => void;
};
declare function useForm(store: StoreApiWithImmer<any>): FormMeta;
declare function validateForm<FormState = any>(store: StoreApiWithImmer<FormState>): Promise<boolean>;
declare function createFormContext<Values extends object>(): [(props: {
  children: React.ReactNode;
  store: StoreApiWithImmer<FormSchema<Values>>;
}) => React.ReactNode, () => StoreApiWithImmer<FormSchema<Values>>];
//#endregion
//#region src/index.d.ts
declare const createForm: <Values extends object>(values: Values) => StoreApiWithImmer<FormSchema<Values>>;
//#endregion
export { type FieldDescriptor, type FieldState, type Validator, createField, createForm, createFormContext, emailPattern, field, isLeft, isRight, left, max, maxLength, min, minLength, pattern, pipe, required, right, updateFieldValue, useField, useForm, useStore, validateForm };