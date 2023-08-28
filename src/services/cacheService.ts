import NodeCache from 'node-cache';

const cache = new NodeCache();

const get = <T>(key: string) => cache.get<T>(key);

const set = <T>(key: string, value: T, ttl: number) => cache.set(key, value, ttl);

export { get, set };
