import { produce } from "immer";
import type { Draft } from "immer";
import type { StoreApi } from "./store";

type SetStateWithImmer<T> = (fn: (draft: Draft<T>) => void) => void;

export interface StoreApiWithImmer<T> extends Omit<StoreApi<T>, "setState"> {
  setState: SetStateWithImmer<T>;
}

export function immer<T extends object>(
  store: StoreApi<T>,
): StoreApiWithImmer<T> {
  const originalSetState = store.setState;

  const setState: SetStateWithImmer<T> = (fn) => {
    originalSetState((state) =>
      produce(state, (draft) => {
        const nextState = fn(draft);
        return nextState;
      }),
    );
  };

  return {
    getState: store.getState,
    subscribe: store.subscribe,
    getInitialState: store.getInitialState,
    meta: store.meta,
    registerField: store.registerField,
    getRegisteredFields: store.getRegisteredFields,
    setState,
  } as StoreApiWithImmer<T>;
}
