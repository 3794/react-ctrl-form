# react-ctrl-form

A type-safe React form management library with built-in validation, powered by Immer for immutable state updates.

## Installation

```bash
npm install immer
npm install github:3794/react-ctrl-form
```

## Quick Start

```tsx
import { type ComponentProps } from "react";
import {
  createField,
  createForm,
  createFormContext,
  required,
  useField,
  validateForm,
  type FieldDescriptor,
} from "react-ctrl-form";

// 1. Define your form values type
type User = {
  username: string;
  password: string;
};

type LoginFormValues = {
  user: User;
};

// 2. Create form store
const loginFormStore = createForm<LoginFormValues>({
  user: {
    username: "",
    password: "",
  },
});

// 3. Create form context
const [LoginFormProvider, useLoginFormContext] = createFormContext();

// 4. Create field descriptors
const usernameField = createField<LoginFormValues>({
  select: (state) => state.user.username,
  validate: required("Username required"),
});

const passwordField = createField<LoginFormValues>({
  select: (state) => state.user.password,
  validate: required("Password required"),
});

// 5. Create field component
type InputProps = ComponentProps<"input"> & {
  field: FieldDescriptor<string>;
};

function TextInput({ field, ...props }: InputProps) {
  const store = useLoginFormContext();
  const { value, error, setValue } = useField(store, field);

  return (
    <div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        {...props}
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
}

// 6. Create form component
export function LoginForm() {
  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const result = await validateForm(loginFormStore);
    if (result) {
      const state = loginFormStore.getState();
      alert(`Login: ${JSON.stringify(state)}`);
    }
  };

  return (
    <LoginFormProvider store={loginFormStore}>
      <form onSubmit={handleSubmit}>
        <TextInput type="text" field={usernameField} placeholder="Username" />
        <TextInput
          type="password"
          field={passwordField}
          placeholder="Password"
        />
        <button type="submit" className="submit-button">
          Login
        </button>
      </form>
    </LoginFormProvider>
  );
}
```

## Core Concepts

### FieldState<T>

Each field contains both value and error:

```ts
type FieldState<T> = {
  value: T;
  error: string | undefined;
};
```

### FieldDescriptor<Value, T>

Defines how to access and validate a field:

```ts
const usernameField = createField<LoginForm>({
  select: (state) => state.username, // Select from state
  validate: required("Username required"), // Optional validator
});
```

### One useField Per Component

For optimal component re-renders and maintainability, create separate components for each field, where each component uses `useField` exactly once:

```ts
// ✅ Good: Each component manages one field
function EmailInput() {
  const { value, error, setValue } = useField(store, emailField);
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}

function PasswordInput() {
  const { value, error, setValue } = useField(store, passwordField);
  return <input type="password" value={value} onChange={(e) => setValue(e.target.value)} />;
}

// ❌ Avoid: Multiple useField calls in one component
function LoginForm() {
  const email = useField(store, emailField);
  const password = useField(store, passwordField);
  // This causes both fields to re-render when either changes
}
```

## API Reference

### createForm<Values>(initialValues)

Create form state store:

```ts
const store = createForm<LoginForm>({
  username: "",
  password: "",
});
```

### createField<Values>({select, validate})

Create a field descriptor:

```ts
const emailField = createField<LoginForm>({
  select: (state) => state.email,
  validate: emailPattern("Invalid email"),
});
```

### useField(store, fieldDescriptor)

Hook to manage field state. Each component should use `useField` for only one field:

```ts
function UsernameInput() {
  const { value, error, setValue } = useField(store, usernameField);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

### updateFieldValue(store, field, value)

Update a single field (with validation):

```ts
updateFieldValue(store, usernameField, "john");
```

### createFormContext<Values>()

Create a context provider for reusable field components:

```ts
const { FormProvider, useFormContext } = createFormContext<LoginForm>();

function ReusableInput() {
  const store = useFormContext();
  // Use store in reusable components
}
```

## Validators

### Built-in

- `required(message)` - Value must not be empty
- `minLength(min, message)` - String length >= min
- `maxLength(max, message)` - String length <= max
- `min(value, message)` - Number >= value
- `max(value, message)` - Number <= value
- `pattern(regex, message)` - Match regex pattern
- `emailPattern(message)` - Valid email format

### Compose validators

```ts
import { pipe } from "react-ctrl-form";

const validation = pipe(
  required("Email required"),
  emailPattern("Invalid format"),
  asyncValidator,
);
```

### Custom Validator

Create custom validators by implementing the Validator type:

```ts
import { Validator, left, right, type Validator } from "react-ctrl-form";

const minPassword: Validator = async (value) => {
  if (value.length >= 8) {
    return right(value);
  }
  return left("Password must be at least 8 characters");
};

const passwordField = createField<LoginForm>({
  select: (state) => state.password,
  validate: pipe(required("Password is required"), minPassword),
});
```

### Async Validation

```ts
const checkEmail = async (email: string) => {
  const exists = await api.checkEmail(email);
  return exists ? left("Email already in use") : right(email);
};

const emailField = createField<UserForm>({
  select: (state) => state.email,
  validate: checkEmail,
});
```

## Development

```bash
# Install dependencies
pnpm install

# Run playground
pnpm run play

# Run tests
npx playwright install
pnpm run test

# Build library
pnpm run build
```

## License

MIT
