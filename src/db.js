import { openDB } from "idb";

export const dbPromise = openDB("pwa-user-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("users")) {
      db.createObjectStore("users", { keyPath: "RecordID" });
    }
    if (!db.objectStoreNames.contains("pendingUsers")) {
      db.createObjectStore("pendingUsers", { autoIncrement: true });
    }
  },
});
