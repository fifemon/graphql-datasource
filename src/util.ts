export function flatten<T extends Record<string, any>>(
    object: T,
    path: string | null = null,
    separator: string = '.'
  ): T {
    return Object.keys(object).reduce((acc: T, key: string): T => {
      const newPath = [path, key].filter(Boolean).join(separator);
      return typeof object[key] === 'object'
        ? { ...acc, ...flatten(object[key], newPath, separator) }
        : { ...acc, [newPath]: object[key] };
    }, {} as T);
  }