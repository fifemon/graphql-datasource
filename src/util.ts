

export function flatten<T extends Record<string, any>>(object: T, path: string | null = null, separator = '.'): T {
  return Object.keys(object).reduce((acc: T, key: string): T => {
  	const isObject = typeof(object[key]) === 'object' && object[key] != null;
    const newPath = [path, key].filter(Boolean).join(separator);
    return isObject ? { ...acc, ...flatten(object[key], newPath, separator) } : { ...acc, [newPath]: object[key] };
  }, {} as T);
}
