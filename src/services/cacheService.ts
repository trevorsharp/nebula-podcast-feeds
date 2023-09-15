import NodeCache from 'node-cache';

const cache = new NodeCache();

const get = <T>(key: string) => cache.get<T>(key);

const set = <T>(key: string, value: T, ttl: number) => cache.set(key, value, ttl);

const withCache =
  <TFunc extends (...args: any[]) => Promise<any>>(cachePrefix: string, ttl: number, func: TFunc) =>
  async (...args: Parameters<TFunc>): Promise<Awaited<ReturnType<TFunc>>> => {
    const cacheKey = `${cachePrefix}${args.join('-')}`;
    const cacheResult = get<Awaited<ReturnType<TFunc>>>(cacheKey);

    if (cacheResult) return cacheResult;

    const result = await func(...args);

    if (result) set<Awaited<ReturnType<TFunc>>>(cacheKey, result, ttl);

    return result;
  };

export { get, set, withCache };
