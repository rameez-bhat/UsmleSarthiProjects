const PROGRAM_CACHE_TTL =
  6 * 60 * 60 * 1000; // 6 hours

const PROGRAM_CACHE_DB =
  'usmle_sarthi_cache';

const PROGRAM_CACHE_STORE =
  'programs';

const PROGRAM_CACHE_DB_VERSION =
  1;

const programMemoryCache: any = {};


function openProgramCacheDb(): Promise<IDBDatabase> {
  return new Promise(
    (resolve, reject) => {
      const request = indexedDB.open(
        PROGRAM_CACHE_DB,
        PROGRAM_CACHE_DB_VERSION
      );

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = () => {
        const database = request.result;

        if (
          !database.objectStoreNames.contains(
            PROGRAM_CACHE_STORE
          )
        ) {
          database.createObjectStore(
            PROGRAM_CACHE_STORE,
            {
              keyPath: 'pid'
            }
          );
        }
      };
    }
  );
}


async function getCachedPrograms(
  pid: string
) {
  const memoryEntry =
    programMemoryCache[pid];

  if (
    memoryEntry &&
    Date.now() - memoryEntry.timestamp <
      PROGRAM_CACHE_TTL
  ) {
    console.log(
      `Programs ${pid} loaded from memory cache`
    );

    return memoryEntry.data;
  }

  try {
    const database =
      await openProgramCacheDb();

    const entry: any =
      await new Promise(
        (resolve, reject) => {
          const transaction =
            database.transaction(
              PROGRAM_CACHE_STORE,
              'readonly'
            );

          const store =
            transaction.objectStore(
              PROGRAM_CACHE_STORE
            );

          const request =
            store.get(pid);

          request.onsuccess = () => {
            resolve(request.result);
          };

          request.onerror = () => {
            reject(request.error);
          };
        }
      );

    database.close();

    if (!entry) {
      return null;
    }

    if (
      Date.now() - entry.timestamp >=
      PROGRAM_CACHE_TTL
    ) {
      await clearProgramCache(pid);
      return null;
    }

    if (!Array.isArray(entry.data)) {
      await clearProgramCache(pid);
      return null;
    }

    programMemoryCache[pid] = {
      timestamp: entry.timestamp,
      data: entry.data
    };

    console.log(
      `Programs ${pid} loaded from IndexedDB cache`
    );

    return entry.data;

  } catch (e) {
    console.warn(
      'Program IndexedDB cache read failed:',
      e
    );

    return null;
  }
}


async function setCachedPrograms(
  pid: string,
  data: any[]
) {
  const timestamp = Date.now();

  programMemoryCache[pid] = {
    timestamp,
    data
  };

  try {
    const database =
      await openProgramCacheDb();

    await new Promise<void>(
      (resolve, reject) => {
        const transaction =
          database.transaction(
            PROGRAM_CACHE_STORE,
            'readwrite'
          );

        const store =
          transaction.objectStore(
            PROGRAM_CACHE_STORE
          );

        store.put({
          pid,
          timestamp,
          data
        });

        transaction.oncomplete = () => {
          resolve();
        };

        transaction.onerror = () => {
          reject(transaction.error);
        };

        transaction.onabort = () => {
          reject(transaction.error);
        };
      }
    );

    database.close();

    console.log(
      `Programs ${pid} saved to IndexedDB cache`
    );

  } catch (e) {
    console.warn(
      'Program IndexedDB cache save failed:',
      e
    );
  }
}


async function clearProgramCache(
  pid?: string
) {
  if (pid) {
    delete programMemoryCache[pid];
  } else {
    Object.keys(
      programMemoryCache
    ).forEach(
      key => {
        delete programMemoryCache[key];
      }
    );
  }

  try {
    const database =
      await openProgramCacheDb();

    await new Promise<void>(
      (resolve, reject) => {
        const transaction =
          database.transaction(
            PROGRAM_CACHE_STORE,
            'readwrite'
          );

        const store =
          transaction.objectStore(
            PROGRAM_CACHE_STORE
          );

        if (pid) {
          store.delete(pid);
        } else {
          store.clear();
        }

        transaction.oncomplete = () => {
          resolve();
        };

        transaction.onerror = () => {
          reject(transaction.error);
        };
      }
    );

    database.close();

  } catch (e) {
    console.warn(
      'Unable to clear program cache:',
      e
    );
  }
}


function getTimestampNumber(
  value: any
) {
  if (!value) {
    return 0;
  }

  if (
    typeof value.toMillis === 'function'
  ) {
    return value.toMillis();
  }

  if (
    value.seconds !== undefined &&
    value.seconds !== null
  ) {
    return (
      Number(value.seconds) * 1000 +
      Number(value.nanoseconds || 0) / 1e6
    );
  }

  const numericValue = Number(value);

  if (!Number.isNaN(numericValue)) {
    return numericValue;
  }

  const dateValue =
    new Date(value).getTime();

  return Number.isNaN(dateValue)
    ? 0
    : dateValue;
}



export { getCachedPrograms, setCachedPrograms, clearProgramCache, getTimestampNumber };
