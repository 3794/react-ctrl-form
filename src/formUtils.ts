// FieldState: 각 리프노드에 value와 error를 함께 저장
export type FieldState<T> = {
  value: T;
  error: string | undefined;
};

// Values 타입을 FieldState 구조로 변환
export type FormSchema<Values> = {
  [K in keyof Values]: Values[K] extends object
    ? FormSchema<Values[K]>
    : FieldState<Values[K]>;
};

// FieldState 생성 헬퍼
export function field<T>(value: T): FieldState<T> {
  return { value, error: undefined };
}

// Form 라이브러리
export function buildFormFields<T extends object>(obj: T): FormSchema<T> {
  const result: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === "object" && item !== null
          ? buildFormFields(item)
          : { value: item, error: undefined },
      );
    } else if (typeof value === "object" && value !== null) {
      result[key] = buildFormFields(value);
    } else {
      result[key] = { value, error: undefined };
    }
  }
  return result;
}

// FormSchema에서 isValid 계산 (모든 필드에 error가 없는지 확인)
export function isFormValid(schema: any): boolean {
  for (const key in schema) {
    const field = schema[key];
    if (field && typeof field === "object") {
      if ("error" in field && field.error !== undefined) {
        return false;
      }
      if (!("value" in field)) {
        // nested form schema인 경우
        if (!isFormValid(field)) {
          return false;
        }
      }
    }
  }
  return true;
}
