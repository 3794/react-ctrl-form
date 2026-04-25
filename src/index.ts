// React
export {
  useStore,
  useField,
  useForm,
  createField,
  createFormContext,
  updateFieldValue,
  validateForm,
} from "./react";
export type { FieldDescriptor } from "./react";

// Form
export type { FieldState } from "./formUtils";
export { field } from "./formUtils";

// validators
export {
  required,
  minLength,
  maxLength,
  min,
  max,
  pattern,
  emailPattern,
  pipe,
  left,
  right,
  isLeft,
  isRight,
} from "./validators";
export type { Validator } from "./validators";

// Combined
import { createVanilla } from "./store";
import { immer } from "./immer";
import { buildFormFields } from "./formUtils";

const create = <T extends object>(initialState: T) =>
  immer(createVanilla(initialState));

export const createForm = <Values extends object>(values: Values) => {
  const formState = buildFormFields(values);
  return create(formState);
};
