const ODIN = require('../src/odin.js');

describe('ODIN Library', () => {
  beforeEach(() => {
    // Clear all storage before each test
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('AutoStorage', () => {
    test('should create AutoStorage instance with basic configuration', () => {
      const storage = new ODIN.AutoStorage('test-storage', {
        username: {
          settings: { defaultValue: 'testuser' }
        }
      });

      expect(storage).toBeDefined();
      expect(storage.namespace).toBe('test-storage');
      expect(storage.get.username).toBeDefined();
      expect(storage.set.username).toBeDefined();
    });

    test('should store and retrieve values', () => {
      const storage = new ODIN.AutoStorage('test-storage', {
        username: {
          settings: { defaultValue: 'testuser' }
        }
      });

      storage.set.username('newuser');
      expect(storage.get.username()).toBe('newuser');
    });

    test('should use default values when no value is set', () => {
      const storage = new ODIN.AutoStorage('test-storage', {
        username: {
          settings: { defaultValue: 'defaultuser' }
        }
      });

      expect(storage.get.username()).toBe('defaultuser');
    });

    test('should handle different storage types', () => {
      const storage = new ODIN.AutoStorage('test-storage', {
        localData: {
          settings: { 
            storageType: ODIN.STORAGE_TYPE.LOCAL,
            defaultValue: 'local'
          }
        },
        sessionData: {
          settings: { 
            storageType: ODIN.STORAGE_TYPE.SESSION,
            defaultValue: 'session'
          }
        },
        memoryData: {
          settings: { 
            storageType: ODIN.STORAGE_TYPE.MEMORY,
            defaultValue: 'memory'
          }
        }
      });

      expect(storage.get.localData()).toBe('local');
      expect(storage.get.sessionData()).toBe('session');
      expect(storage.get.memoryData()).toBe('memory');
    });

    test('should validate on set when provided', () => {
      const storage = new ODIN.AutoStorage('test-storage', {
        age: {
          settings: { 
            storageType: ODIN.STORAGE_TYPE.LOCAL
            // No default value to avoid validation during initialization
          },
          validateOnSet: (value) => {
            // The value passed to validateOnSet is JSON stringified
            const parsedValue = JSON.parse(value);
            if (typeof parsedValue !== 'number' || parsedValue < 0) {
              throw new Error('Age must be a positive number');
            }
          }
        }
      });

      expect(() => storage.set.age(25)).not.toThrow();
      expect(() => storage.set.age(-5)).toThrow('Age must be a positive number');
      expect(() => storage.set.age('not a number')).toThrow('Age must be a positive number');
    });

    test('should check if key exists', () => {
      const storage = new ODIN.AutoStorage('test-storage', {
        username: {
          settings: { defaultValue: 'testuser' }
        }
      });

      expect(storage.exists('username')).toBe(true);
      expect(storage.exists('nonexistent')).toBe(false);
    });

    test('should get all items as object', () => {
      const storage = new ODIN.AutoStorage('test-storage', {
        username: {
          settings: { defaultValue: 'testuser' }
        },
        email: {
          settings: { defaultValue: 'test@example.com' }
        }
      });

      const allItems = storage.getItemsAsObject();
      expect(allItems).toEqual({
        username: 'testuser',
        email: 'test@example.com'
      });
    });
  });

  describe('STORAGE_TYPE constants', () => {
    test('should have correct storage type constants', () => {
      expect(ODIN.STORAGE_TYPE.MEMORY).toBe('memory');
      expect(ODIN.STORAGE_TYPE.SESSION).toBe('session');
      expect(ODIN.STORAGE_TYPE.LOCAL).toBe('local');
    });
  });

  describe('Error handling', () => {
    test('should throw AutoStorageNullValueError for null values', () => {
      const storage = new ODIN.AutoStorage('test-storage', {
        requiredField: {
          settings: { storageType: ODIN.STORAGE_TYPE.LOCAL }
        }
      });

      expect(() => storage.get.requiredField()).toThrow(ODIN.AutoStorageNullValueError);
    });

    test('should allow null values when canBeEmpty is true', () => {
      const storage = new ODIN.AutoStorage('test-storage', {
        optionalField: {
          settings: { 
            storageType: ODIN.STORAGE_TYPE.LOCAL,
            canBeEmpty: true
          }
        }
      });

      expect(() => storage.get.optionalField()).not.toThrow();
      expect(storage.get.optionalField()).toBe(null);
    });
  });
});