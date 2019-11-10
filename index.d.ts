export function enumerate<T extends string>(): { [K in T]: K };
