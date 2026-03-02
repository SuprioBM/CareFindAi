const store = new Map();

export function makeMockRedis() {
  return {
    async get(key) {
      return store.has(key) ? store.get(key) : null;
    },
    async set(key, value) {
      store.set(key, value);
      return "OK";
    },
    async del(key) {
      const existed = store.delete(key);
      return existed ? 1 : 0;
    },
    _clear() {
      store.clear();
    },
  };
}
