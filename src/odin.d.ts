/**
 * On-Demand Information Nexus - TypeScript Definitions
 * A powerful JavaScript library for client-side storage with encryption and auto-sync capabilities
 */

export interface StorageSettings {
  canBeEmpty?: boolean;
  storageType: 'memory' | 'session' | 'local';
  defaultValue?: any;
}

export interface ItemInitParams {
  settings?: StorageSettings;
  validateOnGet?: (value: any) => void;
  validateOnSet?: (value: any) => void;
}

export interface ItemInitCollection {
  [key: string]: ItemInitParams;
}

export interface Setter {
  (value: any): void;
}

export interface Getter {
  (): any;
}

export interface Mutator {
  updateStorageType: (storageType: string) => void;
  delete: () => void;
}

export interface CommitTracker {
  [key: string]: {
    settings: {
      storageType: string;
      defaultValue: boolean;
    };
  };
}

export interface BatchItem {
  id: string;
  value: any;
}

export interface AuthResult {
  loggedIn: boolean;
  usingDefaultPassword: boolean;
}

export interface StorageGetters {
  [key: string]: Getter;
}

export interface StorageSetters {
  [key: string]: Setter;
}

export interface StorageMutators {
  [key: string]: Mutator;
}

export class AutoStorageNullValueError extends Error {
  autoStorageKey: string;
  constructor(autoStorageKey: string);
}

export class AutoStorage {
  static STORAGE_TYPE: {
    MEMORY: 'memory';
    SESSION: 'session';
    LOCAL: 'local';
  };

  static nullthrows<T>(nullable: T | null | undefined, error: Error, onlyCheckForNull?: boolean): T;

  unstableStorage: { [key: string]: any };
  namespace: string | null;
  set: StorageSetters;
  get: StorageGetters;
  settings: { [key: string]: StorageSettings };
  mutate: StorageMutators;

  constructor(namespace: string, obj: ItemInitCollection);

  makeSetter(name: string, params: ItemInitParams): Setter;
  makeGetter(name: string, params: ItemInitParams): Getter;
  makeMutator(name: string): Mutator;
  settingsKey(): string;
  itemKey(name: string): string;
  setDefaultValueForItem(name: string): void;
  getItem(key: string, settings: StorageSettings): string;
  getItemFromStorage(key: string, settings: StorageSettings): string;
  validateItem(
    item: string,
    key: string,
    settings: StorageSettings,
    validateOnGet?: (value: any) => void,
    doNotThrowIfNull?: boolean
  ): any;
  setItem(key: string, value: string, settings: StorageSettings, validateOnSet?: (value: any) => void): string;
  removeItem(key: string, settings: StorageSettings): void;
  exists(name: string): boolean;
  addItem(name: string, params?: ItemInitParams): void;
  updateStorageType(storageType: string): void;
  getKeys(): string[];
  getItemsAsObject(): { [key: string]: any };
}

export class Crypt {
  salt: ArrayBuffer;
  iv: ArrayBuffer;
  password: string | null;

  getKeyMaterial(password: string): Promise<CryptoKey>;
  getKey(keyMaterial: CryptoKey): Promise<CryptoKey>;
  encrypt(str: string, password: string): Promise<string>;
  decrypt(str: string, password: string): Promise<string>;
  setSalt(str: string): this;
  setIv(str: string): this;
  setPassword(newPassword: string): this;
  encryptStorage(autoStorage: AutoStorage): Promise<void>;
  encryptItem(autoStorage: AutoStorage, key: string): Promise<void>;
  encryptValue(setter: Setter, value: any): Promise<void>;
  decryptItem(getter: Getter): Promise<any>;
  decryptWithTestPassword(getter: Getter, password: string): Promise<any>;
}

export class SecretStorage {
  get: StorageGetters;
  set: StorageSetters;
  mutate: StorageMutators;
  namespace: string;

  constructor(namespace: string, obj: ItemInitCollection);

  authenticate(password: string): Promise<AuthResult>;
  logIn(password: string): Promise<AuthResult>;
  changePassword(oldPassword: string, newPassword: string): Promise<boolean>;
  getKeys(): string[];
}

export class SuperStorage {
  get: StorageGetters;
  set: StorageSetters;
  mutate: StorageMutators;
  batch: { [key: string]: any };
  serverPost: (batch: BatchItem[]) => Promise<any> | void;
  storage: AutoStorage | SecretStorage;
  commitTracker: AutoStorage;

  constructor(
    storage: AutoStorage | SecretStorage,
    interval: number,
    postToServer?: (batch: BatchItem[]) => Promise<any> | void
  );

  killInterval(): void;
  startInterval(interval: number): void;
  createCommitTracker(): AutoStorage;
  commitAll(): Promise<void>;
  commit(key: string): Promise<void>;
}

export interface ODIN {
  STORAGE_TYPE: {
    MEMORY: 'memory';
    SESSION: 'session';
    LOCAL: 'local';
  };
  AutoStorage: typeof AutoStorage;
  SecretStorage: typeof SecretStorage;
  SuperStorage: typeof SuperStorage;
  Crypt: typeof Crypt;
}

declare const ODIN: ODIN;
export default ODIN;