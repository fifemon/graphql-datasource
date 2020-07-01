export function flatten<T extends Record<string, any>>(object: T, path: string | null = null, separator = '.'): T {
  return Object.keys(object).reduce((acc: T, key: string): T => {
    const isObject = typeof object[key] === 'object' && object[key] != null;
    const newPath = [path, key].filter(Boolean).join(separator);
    return isObject ? { ...acc, ...flatten(object[key], newPath, separator) } : { ...acc, [newPath]: object[key] };
  }, {} as T);
}

export function isRFC3339_ISO6801(str: any): boolean {
  if (typeof str !== 'string') {
    return false;
  }
  if (!str.endsWith('Z')) {
    return false;
  }
  var d = new Date(str);
  if (d.toISOString() === str) {
    return true;
  } else {
    return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/.test(str);
  }
}
