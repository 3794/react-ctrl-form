import React, { ComponentProps, useId } from "react";
import {
  createForm,
  createField,
  useField,
  useStore,
  required,
  emailPattern,
  minLength,
  pipe,
  right,
  left,
  type Validator,
  type FieldDescriptor,
} from "../../../src";

type ValidationFormValues = {
  email: string;
  password: string;
};

const store = createForm<ValidationFormValues>({
  email: "",
  password: "",
});

const checkEmailUniqueness = async (email: string): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return email !== "test@example.com";
};

const checkEmailDuplicate: Validator = async (value) => {
  const isUnique = await checkEmailUniqueness(value);
  return isUnique ? right(value) : left("Email already in use");
};

const emailValidation = pipe(
  required("Email is required"),
  emailPattern("Invalid email format"),
  checkEmailDuplicate,
);

const passwordValidation = pipe(
  required("Password is required"),
  minLength(8, "Password must be at least 8 characters"),
);

const emailField = createField<ValidationFormValues>({
  select: (s) => s.email,
  validate: emailValidation,
});

const passwordField = createField<ValidationFormValues>({
  select: (s) => s.password,
  validate: passwordValidation,
});

type Props = ComponentProps<"input"> & {
  field: FieldDescriptor<string>;
  label: string;
};
function TextInput({ field, label, ...props }: Props) {
  const id = useId();
  const { value, error, setValue } = useField(store, field);

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`form-input ${error ? "error" : ""}`}
        {...props}
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

function ValidateButton() {
  const formState = useStore(store, (s) => s);
  const [formValid, setFormValid] = React.useState<boolean | null>(null);

  const hasErrors = formState.email.error || formState.password.error;

  const handleValidateForm = async () => {
    // Manually trigger validation
    if (formState.email.value) {
      await emailValidation(formState.email.value);
    }
    if (formState.password.value) {
      await passwordValidation(formState.password.value);
    }
    setFormValid(!hasErrors);
  };

  return (
    <>
      <div className="button-group">
        <button onClick={handleValidateForm} className="button-secondary">
          Validate All
        </button>
      </div>

      <div className="form-state-display">
        <p>Is Valid: {!hasErrors ? "Yes ✓" : "No ✗"}</p>
        {formValid !== null && (
          <div
            className={`validation-result ${formValid ? "success" : "error"}`}
          >
            {formValid ? "✓ Form is valid" : "✗ Form has errors"}
          </div>
        )}
      </div>
    </>
  );
}

export function ValidationTab() {
  return (
    <div>
      <p>Field validation happens automatically as you type</p>

      <TextInput
        type="text"
        field={emailField}
        label="Email (with async validation)"
        placeholder="Enter email"
      />
      <TextInput
        type="password"
        field={passwordField}
        label="Password"
        placeholder="Enter password"
      />
      <ValidateButton />
    </div>
  );
}
