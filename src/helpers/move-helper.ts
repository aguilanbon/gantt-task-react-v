export const initDB = async () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("taskMoveDB", 1);

    request.onupgradeneeded = event => {
      const db = (event.target as IDBRequest).result as IDBDatabase;

      if (!db.objectStoreNames.contains("taskMoves")) {
        db.createObjectStore("taskMoves", { autoIncrement: true });
      }
    };

    request.onsuccess = event => {
      const db = (event.target as IDBRequest).result as IDBDatabase;
      resolve(db);
    };

    request.onerror = event => {
      reject((event.target as IDBRequest).error);
    };
  });
};

export const saveMoveToDB = async (actionType: string, payload: any) => {
  const db = await initDB();

  const transaction = db.transaction("taskMoves", "readwrite");
  const store = transaction.objectStore("taskMoves");

  const clearRequest = store.clear();

  return new Promise<void>((resolve, reject) => {
    clearRequest.onsuccess = () => {
      const data = {
        type: actionType,
        payload,
        timestamp: new Date().toISOString(),
      };

      const addRequest = store.add(data);

      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };

    clearRequest.onerror = () => reject(clearRequest.error);
  });
};

export const refreshDB = async () => {
  const db = await initDB();
  const transaction = db.transaction("taskMoves", "readonly");
  const store = transaction.objectStore("taskMoves");
  const request = store.getAll(); 

  request.onsuccess = () => {
  };
};

const startWatchingDB = () => {
  setInterval(async () => {
    await refreshDB();
  }, 0); 
};


startWatchingDB();

export const openDBConnection = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("taskMoveDB", 1);

    request.onupgradeneeded = (event: Event) => {
      const db = (event.target as IDBRequest).result as IDBDatabase;
      if (!db.objectStoreNames.contains("taskMoves")) {
        db.createObjectStore("taskMoves", { autoIncrement: true });
      }
    };

    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBRequest).result as IDBDatabase;
      resolve(db); 
    };

    request.onerror = (event: Event) => {
      reject("Error opening database: " + (event.target as IDBRequest).error);
    };
  });
};

