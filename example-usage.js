/**
 * ODIN Storage Library - Example Usage
 * This file demonstrates how to use the ODIN library in different environments
 */

// Example 1: Basic AutoStorage usage
console.log('=== Basic AutoStorage Example ===');

// In a browser environment, ODIN will be available globally
// In Node.js/CommonJS: const ODIN = require('odin-storage');
// In ES6 modules: import ODIN from 'odin-storage';

const userStorage = new ODIN.AutoStorage('user-profile', {
  username: {
    settings: { 
      defaultValue: 'Anonymous', 
      storageType: ODIN.STORAGE_TYPE.LOCAL 
    }
  },
  email: {
    settings: { 
      defaultValue: '', 
      storageType: ODIN.STORAGE_TYPE.LOCAL 
    }
  },
  sessionId: {
    settings: { 
      storageType: ODIN.STORAGE_TYPE.SESSION 
    }
  },
  tempData: {
    settings: { 
      storageType: ODIN.STORAGE_TYPE.MEMORY 
    }
  }
});

// Store some data
userStorage.set.username('JohnDoe');
userStorage.set.email('john@example.com');
userStorage.set.sessionId('session-12345');
userStorage.set.tempData({ lastAction: 'login', timestamp: Date.now() });

// Retrieve data
console.log('Username:', userStorage.get.username());
console.log('Email:', userStorage.get.email());
console.log('Session ID:', userStorage.get.sessionId());
console.log('Temp Data:', userStorage.get.tempData());

// Example 2: Validation
console.log('\n=== Validation Example ===');

const validatedStorage = new ODIN.AutoStorage('validated-data', {
  age: {
    settings: { 
      storageType: ODIN.STORAGE_TYPE.LOCAL 
    },
    validateOnSet: (value) => {
      const parsedValue = JSON.parse(value);
      if (typeof parsedValue !== 'number' || parsedValue < 0) {
        throw new Error('Age must be a positive number');
      }
    }
  }
});

try {
  validatedStorage.set.age(25);
  console.log('Age set successfully:', validatedStorage.get.age());
} catch (error) {
  console.error('Validation error:', error.message);
}

// Example 3: Error handling
console.log('\n=== Error Handling Example ===');

const errorStorage = new ODIN.AutoStorage('error-test', {
  requiredField: {
    settings: { 
      storageType: ODIN.STORAGE_TYPE.LOCAL 
    }
  }
});

try {
  const value = errorStorage.get.requiredField();
  console.log('Value:', value);
} catch (error) {
  if (error instanceof ODIN.AutoStorageNullValueError) {
    console.log('Field is not set (expected)');
  } else {
    console.error('Unexpected error:', error);
  }
}

// Example 4: Storage type management
console.log('\n=== Storage Type Management Example ===');

const flexibleStorage = new ODIN.AutoStorage('flexible-storage', {
  data: {
    settings: { 
      defaultValue: 'initial value',
      storageType: ODIN.STORAGE_TYPE.LOCAL 
    }
  }
});

console.log('Initial storage type: LOCAL');
console.log('Value:', flexibleStorage.get.data());

// Change storage type to session
flexibleStorage.mutate.data.updateStorageType(ODIN.STORAGE_TYPE.SESSION);
console.log('Changed to SESSION storage');
console.log('Value:', flexibleStorage.get.data());

// Example 5: Get all items
console.log('\n=== Get All Items Example ===');

const multiStorage = new ODIN.AutoStorage('multi-data', {
  name: { settings: { defaultValue: 'Test User' } },
  age: { settings: { defaultValue: 30 } },
  city: { settings: { defaultValue: 'New York' } }
});

const allData = multiStorage.getItemsAsObject();
console.log('All stored data:', allData);

console.log('\n=== ODIN Storage Examples Complete ===');