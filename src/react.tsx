import { useSyncExternalStore, createContext, useContext } from "react";
import type { StoreApiWithImmer } from "./immer";
import type { FieldState, FormSchema } from "./formUtils";
import { isFormValid } from "./formUtils";
import type { Validator } from "./validators";
import { isLeft } from "./validators";
import type React from "react";

export function useStore<T, U>(
  store: StoreApiWithImmer<T>,
  selector: (state: T) => U,
): U {
  return useSyncExternalStore(
    (listener) =>
      store.subscribe(() => {
        listener();
      }),
    () => selector(store.getState()),
  );
}

export type FieldDescriptor<Value, T = any> = {
  select: (s: T) => FieldState<Value>;
  validate?: Validator<Value>;
};

export function createField<Values extends object, Value = any>(config: {
  select: (s: FormSchema<Values>) => FieldState<Value>;
  validate?: Validator<Value>;
}): FieldDescriptor<Value, FormSchema<Values>> {
  return config;
}

export function updateFieldValue<Value, FormState = any>(
  store: StoreApiWithImmer<FormState>,
  field: FieldDescriptor<Value, FormState>,
  value: Value,
) {
  // 즉시 값 업데이트, error 초기화, isDirty true로 설정
  store.setState((draft) => {
    const fieldObj = field.select(draft as FormState);
    fieldObj.value = value;
    fieldObj.error = undefined;
  });

  store.meta.setMeta((meta) => ({
    ...meta,
    isDirty: true,
  }));

  // 비동기 validate
  if (field.validate) {
    field.validate(value).then((result) => {
      store.setState((draft) => {
        const fieldObj = field.select(draft as FormState);
        fieldObj.error = isLeft(result) ? result.value : undefined;
      });

      store.meta.setMeta((meta) => ({
        ...meta,
        isValid: isFormValid(store.getState()),
      }));
    });
  }
}

export function useField<Value, FormState = any>(
  store: StoreApiWithImmer<FormState>,
  field: FieldDescriptor<Value, FormState>,
) {
  store.registerField(field);

  const { value, error } = useStore(store, field.select);

  const setValue = (v: Value) => {
    updateFieldValue(store, field, v);
  };

  return {
    value,
    error,
    setValue,
  };
}

export function useForm(store: StoreApiWithImmer<any>) {
  return useSyncExternalStore(
    (listener) => store.meta.subscribe(listener),
    () => store.meta.getMeta(),
  );
}

export async function validateForm<FormState = any>(
  store: StoreApiWithImmer<FormState>,
): Promise<boolean> {
  const fields = store.getRegisteredFields();
  const state = store.getState();

  // 모든 필드의 validation 실행
  const validationPromises = fields.map((field) => {
    const fieldState = field.select(state);
    if (!field.validate) return Promise.resolve(null);
    return field.validate(fieldState.value);
  });

  const results = await Promise.all(validationPromises);

  // isValid 계산 (results 기반)
  const isValid = !results.some((result) => result && isLeft(result));

  // 에러 업데이트
  store.setState((draft) => {
    fields.forEach((field, i) => {
      const fieldObj = field.select(draft as FormState);
      const result = results[i];
      if (result) {
        fieldObj.error = isLeft(result) ? result.value : undefined;
      }
    });
  });

  // meta 업데이트
  store.meta.setMeta((meta) => ({
    ...meta,
    isValid,
    isDirty: true,
  }));

  return isValid;
}

// Form Context Provider
export function createFormContext<Values extends object>(): [
  (props: {
    children: React.ReactNode;
    store: StoreApiWithImmer<FormSchema<Values>>;
  }) => React.ReactNode,
  () => StoreApiWithImmer<FormSchema<Values>>,
] {
  type FormState = FormSchema<Values>;
  const FormContext = createContext<StoreApiWithImmer<FormState> | null>(null);

  function FormProvider({
    children,
    store,
  }: {
    children: React.ReactNode;
    store: StoreApiWithImmer<FormState>;
  }) {
    return (
      <FormContext.Provider value={store}>{children}</FormContext.Provider>
    );
  }

  function useFormContext() {
    const s = useContext(FormContext);
    if (!s) {
      throw new Error("useFormContext must be used inside FormProvider");
    }
    return s;
  }

  return [FormProvider, useFormContext];
}
