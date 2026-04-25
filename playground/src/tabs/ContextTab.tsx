import { useId } from "react";
import {
  createFormContext,
  createForm,
  createField,
  useField,
  pipe,
  required,
  emailPattern,
  type FieldDescriptor,
} from "../../../src";

type ContextFormValues = {
  email: string;
};

const [FormProvider, useFormContext] = createFormContext<ContextFormValues>();

const store1 = createForm<ContextFormValues>({ email: "" });
const store2 = createForm<ContextFormValues>({ email: "" });

const emailValidation = pipe(
  required("Email is required"),
  emailPattern("Invalid email format"),
);

const emailField = createField<ContextFormValues>({
  select: (s) => s.email,
  validate: emailValidation,
});

function EmailInput({
  field,
  label,
  placeholder,
}: {
  field: FieldDescriptor<string>;
  label: string;
  placeholder?: string;
}) {
  const id = useId();
  const store = useFormContext();
  const { value, error, setValue } = useField(store, field);

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="form-input"
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export function ContextTab() {
  return (
    <div>
      <p>
        <strong>FormProvider</strong> allows reusable field components to work
        with any form
      </p>

      <h3>Form 1</h3>
      <FormProvider store={store1}>
        <EmailInput
          field={emailField}
          label="Email"
          placeholder="Enter email"
        />
      </FormProvider>

      <h3>Form 2</h3>
      <FormProvider store={store2}>
        <EmailInput
          field={emailField}
          label="Email"
          placeholder="Enter email"
        />
      </FormProvider>
    </div>
  );
}
