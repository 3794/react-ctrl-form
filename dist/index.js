import { createContext, useContext, useSyncExternalStore } from "react";
import { jsx } from "react/jsx-runtime";
import { produce } from "immer";
//#region src/formUtils.ts
function field(value) {
	return {
		value,
		error: void 0
	};
}
function buildFormFields(obj) {
	const result = {};
	for (const key in obj) {
		const value = obj[key];
		if (Array.isArray(value)) result[key] = value.map((item) => typeof item === "object" && item !== null ? buildFormFields(item) : {
			value: item,
			error: void 0
		});
		else if (typeof value === "object" && value !== null) result[key] = buildFormFields(value);
		else result[key] = {
			value,
			error: void 0
		};
	}
	return result;
}
function isFormValid(schema) {
	for (const key in schema) {
		const field = schema[key];
		if (field && typeof field === "object") {
			if ("error" in field && field.error !== void 0) return false;
			if (!("value" in field)) {
				if (!isFormValid(field)) return false;
			}
		}
	}
	return true;
}
//#endregion
//#region src/validators.ts
const left = (value) => ({
	tag: "left",
	value
});
const right = (value) => ({
	tag: "right",
	value
});
const isLeft = (e) => e.tag === "left";
const isRight = (e) => e.tag === "right";
const required = (message) => async (value) => value ? right(value) : left(message);
const minLength = (min, message) => async (value) => value?.length >= min ? right(value) : left(message);
const maxLength = (max, message) => async (value) => value?.length <= max ? right(value) : left(message);
const min = (minVal, message) => async (value) => Number(value) >= minVal ? right(value) : left(message);
const max = (maxVal, message) => async (value) => Number(value) <= maxVal ? right(value) : left(message);
const pattern = (regex, message) => async (value) => regex.test(value) ? right(value) : left(message);
const emailPattern = (message) => async (value) => await pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message)(value);
const pipe = (...validators) => async (value) => {
	for (const validator of validators) {
		const result = await validator(value);
		if (isLeft(result)) return result;
	}
	return right(value);
};
//#endregion
//#region src/react.tsx
function useStore(store, selector) {
	return useSyncExternalStore((listener) => store.subscribe(() => {
		listener();
	}), () => selector(store.getState()));
}
function createField(config) {
	return config;
}
function updateFieldValue(store, field, value) {
	store.setState((draft) => {
		const fieldObj = field.select(draft);
		fieldObj.value = value;
		fieldObj.error = void 0;
	});
	store.meta.setMeta((meta) => ({
		...meta,
		isDirty: true
	}));
	if (field.validate) field.validate(value).then((result) => {
		store.setState((draft) => {
			const fieldObj = field.select(draft);
			fieldObj.error = isLeft(result) ? result.value : void 0;
		});
		store.meta.setMeta((meta) => ({
			...meta,
			isValid: isFormValid(store.getState())
		}));
	});
}
function useField(store, field) {
	store.registerField(field);
	const { value, error } = useStore(store, field.select);
	const setValue = (v) => {
		updateFieldValue(store, field, v);
	};
	return {
		value,
		error,
		setValue
	};
}
function useForm(store) {
	return useSyncExternalStore((listener) => store.meta.subscribe(listener), () => store.meta.getMeta());
}
async function validateForm(store) {
	const fields = store.getRegisteredFields();
	const state = store.getState();
	const validationPromises = fields.map((field) => {
		const fieldState = field.select(state);
		if (!field.validate) return Promise.resolve(null);
		return field.validate(fieldState.value);
	});
	const results = await Promise.all(validationPromises);
	const isValid = !results.some((result) => result && isLeft(result));
	store.setState((draft) => {
		fields.forEach((field, i) => {
			const fieldObj = field.select(draft);
			const result = results[i];
			if (result) fieldObj.error = isLeft(result) ? result.value : void 0;
		});
	});
	store.meta.setMeta((meta) => ({
		...meta,
		isValid,
		isDirty: true
	}));
	return isValid;
}
function createFormContext() {
	const FormContext = createContext(null);
	function FormProvider({ children, store }) {
		return /* @__PURE__ */ jsx(FormContext.Provider, {
			value: store,
			children
		});
	}
	function useFormContext() {
		const s = useContext(FormContext);
		if (!s) throw new Error("useFormContext must be used inside FormProvider");
		return s;
	}
	return [FormProvider, useFormContext];
}
//#endregion
//#region src/store.ts
function createVanilla(initialState) {
	let state = initialState;
	let meta = {
		isValid: true,
		isDirty: false
	};
	const stateListeners = /* @__PURE__ */ new Set();
	const metaListeners = /* @__PURE__ */ new Set();
	const registeredFields = /* @__PURE__ */ new Set();
	const getState = () => state;
	const setState = (fn) => {
		const nextState = fn(state);
		if (Object.is(nextState, state)) return;
		const prevState = state;
		state = nextState;
		stateListeners.forEach((listener) => listener(state, prevState));
	};
	const subscribe = (listener) => {
		stateListeners.add(listener);
		return () => stateListeners.delete(listener);
	};
	const getInitialState = () => initialState;
	const metaStore = {
		getMeta: () => meta,
		setMeta: (fn) => {
			const prevMeta = meta;
			meta = fn(meta);
			if (!Object.is(meta, prevMeta)) metaListeners.forEach((listener) => listener(meta, prevMeta));
		},
		subscribe: (listener) => {
			metaListeners.add(listener);
			return () => metaListeners.delete(listener);
		}
	};
	const registerField = (field) => {
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
		getRegisteredFields
	};
}
//#endregion
//#region src/immer.ts
function immer(store) {
	const originalSetState = store.setState;
	const setState = (fn) => {
		originalSetState((state) => produce(state, (draft) => {
			return fn(draft);
		}));
	};
	return {
		getState: store.getState,
		subscribe: store.subscribe,
		getInitialState: store.getInitialState,
		meta: store.meta,
		registerField: store.registerField,
		getRegisteredFields: store.getRegisteredFields,
		setState
	};
}
//#endregion
//#region src/index.ts
const create = (initialState) => immer(createVanilla(initialState));
const createForm = (values) => {
	return create(buildFormFields(values));
};
//#endregion
export { createField, createForm, createFormContext, emailPattern, field, isLeft, isRight, left, max, maxLength, min, minLength, pattern, pipe, required, right, updateFieldValue, useField, useForm, useStore, validateForm };
