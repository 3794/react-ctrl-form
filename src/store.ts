type StateListener<T> = (state: T, prevState: T) => void;
type MetaListener = (meta: FormMeta, prevMeta: FormMeta) => void;
type SetState<T> = (fn: (state: T) => T) => void;
type GetState<T> = () => T;

export type FormMeta = {
  isValid: boolean;
  isDirty: boolean;
};

type GetMeta = () => FormMeta;
type SetMeta = (fn: (meta: FormMeta) => FormMeta) => void;

export interface MetaStore {
  getMeta: GetMeta;
  setMeta: SetMeta;
  subscribe: (listener: MetaListener) => () => void;
}

export interface StoreApi<T> {
  getState: GetState<T>;
  setState: SetState<T>;
  subscribe: (listener: StateListener<T>) => () => void;
  getInitialState: () => T;
  meta: MetaStore;
  registerField: (field: any) => void;
  getRegisteredFields: () => any[];
}

export function createVanilla<T extends object>(initialState: T): StoreApi<T> {
  let state = initialState;
  let meta: FormMeta = { isValid: true, isDirty: false };
  const stateListeners = new Set<StateListener<T>>();
  const metaListeners = new Set<MetaListener>();
  const registeredFields = new Set<any>();

  const getState: GetState<T> = () => state;

  const setState: SetState<T> = (fn) => {
    const nextState = fn(state);

    if (Object.is(nextState, state)) {
      return;
    }

    const prevState = state;
    state = nextState;
    stateListeners.forEach((listener) => listener(state, prevState));
  };

  const subscribe = (listener: StateListener<T>) => {
    stateListeners.add(listener);
    return () => stateListeners.delete(listener);
  };

  const getInitialState = () => initialState;

  const metaStore: MetaStore = {
    getMeta: () => meta,
    setMeta: (fn) => {
      const prevMeta = meta;
      meta = fn(meta);
      if (!Object.is(meta, prevMeta)) {
        metaListeners.forEach((listener) => listener(meta, prevMeta));
      }
    },
    subscribe: (listener: MetaListener) => {
      metaListeners.add(listener);
      return () => metaListeners.delete(listener);
    },
  };

  const registerField = (field: any) => {
    registeredFields.add(field);
  };

  const getRegisteredFields = () => Array.from(registeredFields);

  return {
    getState,
    setState,
    subscribe,
    getInitialState,
    meta: metaStore,
    registerField,
    getRegisteredFields,
  };
}
