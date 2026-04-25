type Either<L, R> = { tag: "left"; value: L } | { tag: "right"; value: R };

export const left = <L>(value: L): Either<L, never> => ({ tag: "left", value });
export const right = <R>(value: R): Either<never, R> => ({
  tag: "right",
  value,
});

export const isLeft = <L, R>(e: Either<L, R>): e is { tag: "left"; value: L } =>
  e.tag === "left";
export const isRight = <L, R>(
  e: Either<L, R>,
): e is { tag: "right"; value: R } => e.tag === "right";

export type Validator<T = string> = (value: T) => Promise<Either<string, T>>;

export const required =
  (message: string): Validator =>
  async (value) =>
    value ? right(value) : left(message);

export const minLength =
  (min: number, message: string): Validator =>
  async (value) =>
    value?.length >= min ? right(value) : left(message);

export const maxLength =
  (max: number, message: string): Validator =>
  async (value) =>
    value?.length <= max ? right(value) : left(message);

export const min =
  (minVal: number, message: string): Validator =>
  async (value) =>
    Number(value) >= minVal ? right(value) : left(message);

export const max =
  (maxVal: number, message: string): Validator =>
  async (value) =>
    Number(value) <= maxVal ? right(value) : left(message);

export const pattern =
  (regex: RegExp, message: string): Validator =>
  async (value) =>
    regex.test(value) ? right(value) : left(message);

export const emailPattern =
  (message: string): Validator =>
  async (value) =>
    await pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message)(value);

export const pipe =
  (...validators: Validator[]): Validator =>
  async (value) => {
    for (const validator of validators) {
      const result = await validator(value);
      if (isLeft(result)) return result;
    }
    return right(value);
  };
