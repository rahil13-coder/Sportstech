const DB_NAME = 'DigitalLibrary';
const DB_VERSION = 1;
const STORE_NAME = 'books';

export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
};

export const getBooks = (db) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('IndexedDB get error:', event.target.error);
      reject(event.target.error);
    };
  });
};

export const saveBooks = (db, books) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    transaction.onerror = (event) => {
        console.error('IndexedDB transaction error:', event.target.error);
        reject(event.target.error);
    };

    const clearRequest = store.clear();
    clearRequest.onerror = (event) => {
        console.error('IndexedDB clear error:', event.target.error);
        reject(event.target.error);
    }

    clearRequest.onsuccess = () => {
        if (books.length === 0) {
            resolve();
            return;
        }
        
        let completed = 0;
        books.forEach(book => {
            const addRequest = store.add(book);
            addRequest.onsuccess = () => {
                completed++;
                if (completed === books.length) {
                    resolve();
                }
            };
            addRequest.onerror = (event) => {
                console.error('IndexedDB add error:', event.target.error);
                reject(event.target.error);
            };
        });
    }
  });
};
