import React, { useId } from "react";
import {
  createForm,
  createField,
  useField,
  required,
  type FieldDescriptor,
  validateForm,
} from "../../../src";

type User = {
  username: string;
  password: string;
};

type BasicFormValues = {
  user: User;
};

const store = createForm<BasicFormValues>({
  user: {
    username: "",
    password: "",
  },
});

const usernameField = createField<BasicFormValues>({
  select: (s) => s.user.username,
  validate: required("Username is required"),
});

const passwordField = createField<BasicFormValues>({
  select: (s) => s.user.password,
  validate: required("Password is required"),
});

function TextInput({
  field,
  label,
  placeholder,
}: {
  field: FieldDescriptor<string>;
  label: string;
  placeholder?: string;
}) {
  const id = useId();
  const { value, error, setValue } = useField(store, field);

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="form-input"
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

function PasswordInput({
  field,
  label,
  placeholder,
}: {
  field: FieldDescriptor<string>;
  label: string;
  placeholder?: string;
}) {
  const id = useId();
  const { value, error, setValue } = useField(store, field);

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="form-input"
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

function FormStateDisplay() {
  const { value } = useField(store, usernameField);

  return (
    <div className="form-state-display">
      <p>👤 Username: {value || "(empty)"}</p>
    </div>
  );
}

function SubmitButton() {
  return (
    <button type="submit" className="submit-button">
      Login
    </button>
  );
}

export function BasicFormTab() {
  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const result = await validateForm(store);
    if (result) {
      const state = store.getState();
      alert(`Login: ${JSON.stringify(state)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        field={usernameField}
        label="Username"
        placeholder="Enter your username"
      />
      <PasswordInput
        field={passwordField}
        label="Password"
        placeholder="Enter your password"
      />
      <FormStateDisplay />
      <SubmitButton />
    </form>
  );
}
