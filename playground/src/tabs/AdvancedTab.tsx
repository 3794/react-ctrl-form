import { useId } from "react";
import {
  createForm,
  createField,
  useField,
  updateFieldValue,
  emailPattern,
  type FieldDescriptor,
} from "../../../src";

type AdvancedFormValues = {
  name: string;
  email: string;
  age: string;
};

const store = createForm<AdvancedFormValues>({
  name: "",
  email: "",
  age: "",
});

const nameField = createField<AdvancedFormValues>({
  select: (state) => state.name,
});

const emailField = createField<AdvancedFormValues>({
  select: (state) => state.email,
  validate: emailPattern("이메일 형식이 맞지 않습니다."),
});

const ageField = createField<AdvancedFormValues>({
  select: (state) => state.age,
});

function TextInput({
  field,
  label,
  placeholder,
}: {
  label: string;
  field: FieldDescriptor<string>;
  placeholder?: string;
}) {
  const id = useId();
  const { value, setValue } = useField(store, field);

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
    </div>
  );
}

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
  const { value, setValue, error } = useField(store, field);

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

function NumberInput({
  field,
  label,
  placeholder,
}: {
  field: FieldDescriptor<string>;
  label: string;
  placeholder?: string;
}) {
  const id = useId();
  const { value, setValue } = useField(store, field);

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="form-input"
      />
    </div>
  );
}

function DisplayValues() {
  const { value: name } = useField(store, nameField);
  const { value: age } = useField(store, ageField);
  const { value: email } = useField(store, emailField);

  return (
    <code>
      {name}, {email}, {age}
    </code>
  );
}

export function AdvancedTab() {
  const handleSetValue = () => {
    updateFieldValue(store, nameField, "john");
    updateFieldValue(store, emailField, "john@example.com");
    updateFieldValue(store, ageField, "12");
  };

  const handleReset = () => {
    const initialState = store.getInitialState();
    store.setState(() => initialState);
  };

  return (
    <div>
      <TextInput field={nameField} label="name" placeholder="Enter name" />
      <EmailInput field={emailField} label="email" placeholder="Enter email" />
      <NumberInput field={ageField} label="age" placeholder="Enter age" />

      <div className="button-group">
        <button onClick={handleSetValue} className="button-secondary">
          Auto Fill
        </button>
        <button onClick={handleReset} className="button-secondary">
          Reset
        </button>
      </div>

      <div className="form-state-display">
        <p>Values: </p>
        <DisplayValues />
      </div>
    </div>
  );
}
