export function makeMockRedis() {
  const kv = new Map();
  const sets = new Map();
  const expirations = new Map(); // key -> timestamp(ms)

  function isExpired(key) {
    const exp = expirations.get(key);
    if (!exp) return false;
    if (Date.now() > exp) {
      kv.delete(key);
      sets.delete(key);
      expirations.delete(key);
      return true;
    }
    return false;
  }

  async function get(key) {
    if (isExpired(key)) return null;
    return kv.has(key) ? kv.get(key) : null;
  }

  async function set(key, val, opts = {}) {
    kv.set(key, String(val));

    // support { EX: seconds }
    if (opts?.EX) {
      expirations.set(key, Date.now() + opts.EX * 1000);
    } else {
      expirations.delete(key);
    }
    return "OK";
  }

  async function del(...keys) {
    let n = 0;
    for (const k of keys) {
      if (kv.delete(k)) n++;
      if (sets.delete(k)) n++;
      expirations.delete(k);
    }
    return n;
  }

  async function expire(key, seconds) {
    if (isExpired(key)) return 0;
    if (!kv.has(key) && !sets.has(key)) return 0;
    expirations.set(key, Date.now() + seconds * 1000);
    return 1;
  }

  async function incr(key) {
    if (isExpired(key)) {
      // already cleaned
    }
    const cur = kv.has(key) ? Number(kv.get(key)) : 0;
    const next = Number.isFinite(cur) ? cur + 1 : 1;
    kv.set(key, String(next));
    return next;
  }

  // ✅ set ops
  async function sAdd(key, member) {
    if (isExpired(key)) {
      // cleared
    }
    if (!sets.has(key)) sets.set(key, new Set());
    const s = sets.get(key);
    const before = s.size;
    s.add(String(member));
    return s.size > before ? 1 : 0;
  }

  async function sMembers(key) {
    if (isExpired(key)) return [];
    const s = sets.get(key);
    return s ? [...s] : [];
  }

  async function sRem(key, member) {
    if (isExpired(key)) return 0;
    const s = sets.get(key);
    if (!s) return 0;
    return s.delete(String(member)) ? 1 : 0;
  }

  // ✅ multi/exec (minimal)
  function multi() {
    const ops = [];
    return {
      del(...keys) {
        ops.push(() => del(...keys));
        return this;
      },
      set(key, val, opts) {
        ops.push(() => set(key, val, opts));
        return this;
      },
      expire(key, seconds) {
        ops.push(() => expire(key, seconds));
        return this;
      },
      sAdd(key, member) {
        ops.push(() => sAdd(key, member));
        return this;
      },
      sRem(key, member) {
        ops.push(() => sRem(key, member));
        return this;
      },
      async exec() {
        const results = [];
        for (const fn of ops) results.push(await fn());
        return results;
      },
    };
  }

  return {
    get,
    set,
    del,
    expire,
    incr,
    sAdd,
    sMembers,
    sRem,
    multi,

    _clear() {
      kv.clear();
      sets.clear();
      expirations.clear();
    },
  };
}
