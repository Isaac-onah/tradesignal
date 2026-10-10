import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Custom Supabase secure storage adapter. 
 * Splits payloads into 1.8KB chunks to bypass mobile Keychain/Keystore size limits (~2KB)
 * and gracefully falls back to localStorage on web builds.
 */

// Safe chunk size limit well under the ~2KB iOS Keychain restriction
const CHUNK_SIZE = 1800;

/**
 * Helper to safely access browser localStorage when running on web, 
 * avoiding runtime crashes if window/localStorage is undefined.
 */
function browserStorage() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage;
}

/**
 * Safely removes a key from native SecureStore without crashing if the key 
 * was already cleared or does not exist.
 */
async function deleteNative(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Ignore error if key is missing so logout operations complete cleanly
  }
}

/**
 * Custom storage adapter interface conforming to Supabase's required auth storage signature.
 */
export const secureStoreAdapter = {
  // Reads and reconstructs the session token from local storage or keychain chunks
  async getItem(key: string): Promise<string | null> {

    // Check if a chunk count tracker (`${key}.n`) exists
    const countRaw = await SecureStore.getItemAsync(`${key}.n`);
    
    // If no count exists, it's a standard single-value key
    if (!countRaw) {
      return SecureStore.getItemAsync(key);
    }

    const count = Number(countRaw);
    if (!Number.isFinite(count) || count <= 0) return null;

    // Reconstruct the original payload by stitching all chunks back together sequentially
    let value = '';
    for (let index = 0; index < count; index += 1) {
      const part = await SecureStore.getItemAsync(`${key}.${index}`);
      if (part == null) return null; // Abort if any chunk is missing/corrupted
      value += part;
    }
    return value;
  },

  // Persists the session payload, splitting it across multiple keys if it exceeds CHUNK_SIZE
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      browserStorage()?.setItem(key, value);
      return;
    }

    // Always clear any existing single key or legacy chunks before saving a new value
    await secureStoreAdapter.removeItem(key);

    // Standard store if payload fits within a single chunk
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    // Otherwise, slice into chunks and store each with a indexed sub-key (e.g., key.0, key.1)
    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let index = 0; index < count; index += 1) {
      const start = index * CHUNK_SIZE;
      await SecureStore.setItemAsync(`${key}.${index}`, value.slice(start, start + CHUNK_SIZE));
    }
    
    // Save total chunk count under `.n` key so getItem knows how many parts to read
    await SecureStore.setItemAsync(`${key}.n`, String(count));
  },

  // Deletes the key along with all associated sub-chunks
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      browserStorage()?.removeItem(key);
      return;
    }

    // Check if the item was chunked and remove all individual parts
    const countRaw = await SecureStore.getItemAsync(`${key}.n`);
    if (countRaw) {
      const count = Number(countRaw);
      if (Number.isFinite(count)) {
        for (let index = 0; index < count; index += 1) {
          await deleteNative(`${key}.${index}`);
        }
      }
      await deleteNative(`${key}.n`);
    }
    
    // Delete single key if it wasn't chunked
    await deleteNative(key);
  },
};