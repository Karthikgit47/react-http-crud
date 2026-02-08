import { dbPromise } from "./db";

// save users from API
export async function saveUsers(users) {
  const db = await dbPromise;
  const tx = db.transaction("users", "readwrite");
  const store = tx.objectStore("users");

  users.forEach(user => store.put(user));
  await tx.done;
}

// read users when offline
export async function getUsers() {
  const db = await dbPromise;
  return await db.getAll("users");
}

//  ADD FUNCTION HERE
export async function getPendingUsers() {
  const db = await dbPromise;
  return await db.getAll("pendingUsers");
}

// save offline-created users
export async function savePendingUser(user) {
  const db = await dbPromise;
  await db.add("pendingUsers", user);
}

//  delete after sync
export async function deletePendingUser(key) {
  const db = await dbPromise;
  await db.delete("pendingUsers", key);
}

//  sync offline data to API
export async function syncPendingUsers() {
  if (!navigator.onLine) return;

  const db = await dbPromise;

  // IMPORTANT: get keys + values
  const txRead = db.transaction("pendingUsers", "readonly");
  const storeRead = txRead.objectStore("pendingUsers");

  const users = await storeRead.getAll();
  const keys = await storeRead.getAllKeys();

  await txRead.done;

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const key = keys[i]; // THIS is the IndexedDB key

    try {
      const res = await fetch(
        "https://dvmtcreaapi.bexatm.com/api/savepwauser",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Name: user.Name,
            Email: user.Email,
          }),
        }
      );

      const result = await res.json();

      // ✅ Success
      if (res.ok && result.Status === "Y") {
        const tx = db.transaction("pendingUsers", "readwrite");
        tx.objectStore("pendingUsers").delete(key);
        await tx.done;
        continue;
      }

      // ⚠️ Duplicate email → remove to avoid infinite retry
      if (res.status === 422) {
        console.warn(
          "SYNC SKIPPED (validation):",
          user.Email,
          result?.Errors
        );

        const tx = db.transaction("pendingUsers", "readwrite");
        tx.objectStore("pendingUsers").delete(key);
        await tx.done;
        continue;
      }

    } catch (err) {
      console.error("SYNC FAILED (network)", err);
      // keep record → retry later
    }
  }
}



