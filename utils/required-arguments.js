const DEFAULT_REQUIRED_NAME = "argument";

export function requiredArguments(...args) {
  for (const arg of args) {
    const { value, name } = normalizeRequiredArg(arg);
    if (!value) {
      throw new Error(`Missing required argument: ${name}`);
    }
  }
}

function normalizeRequiredArg(arg) {
  if (Array.isArray(arg)) {
    const [value, name] = arg;
    return {
      value,
      name: name ?? DEFAULT_REQUIRED_NAME,
    };
  }

  if (arg && typeof arg === "object" && "value" in arg) {
    return {
      value: arg.value,
      name: arg.name ?? DEFAULT_REQUIRED_NAME,
    };
  }

  return { value: arg, name: DEFAULT_REQUIRED_NAME };
}
