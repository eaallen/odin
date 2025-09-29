# ODIN: On-Demand Information Nexus
*"The All-Father's Wisdom for Modern Web Storage"*

> *"From the depths of Yggdrasil's roots to the heights of Asgard's halls, ODIN brings the ancient wisdom of the Norse gods to your modern web applications. Like Odin sacrificed his eye for knowledge, ODIN sacrifices complexity for simplicity in client-side storage."*

ODIN is a powerful JavaScript library that makes working with local, session, and memory storage as elegant as the runes carved by the ancient Norse. With its declarative initialization process, ODIN ensures your data storage strategy is as clear as the waters of Mímir's well.

## 🌟 Features

- **Three Storage Realms**: Local, Session, and Memory storage types
- **Encrypted Secrets**: Secure storage with AES-GCM encryption
- **Auto-Sync**: Automatic server synchronization with configurable intervals
- **Type Safety**: Built-in validation and error handling
- **Nordic-Inspired API**: Clean, intuitive methods that honor the old ways

## 🚀 Quick Start

### NPM Installation

```bash
npm install odin-storage
```

### CDN Usage

```html
<script src="https://unpkg.com/odin-storage@latest/dist/odin.umd.js"></script>
```

### Direct Download

Download the `odin.js` file and include it in your project:

```html
<script src="odin.js"></script>
```

### ES6 Module Import

```javascript
import ODIN from 'odin-storage';
// or
import { AutoStorage, SecretStorage, SuperStorage } from 'odin-storage';
```

### CommonJS Require

```javascript
const ODIN = require('odin-storage');
// or
const { AutoStorage, SecretStorage, SuperStorage } = require('odin-storage');
```

### Basic Usage - The Mead of Knowledge

```javascript
// Create a storage container worthy of the gods
const userRealm = new ODIN.AutoStorage("user-details", {
    username: {
        settings: { defaultValue: "MjolnirBearer", },
    },
    email: { settings: { defaultValue: "thor@asgard.com" } },
    temporaryData: {
        settings: {
            storageType: ODIN.STORAGE_TYPE.MEMORY, // Like thoughts in Odin's mind
        }
    },
})

// Store knowledge as easily as Odin stores runes
userRealm.set.username("OdinAllFather")
userRealm.set.email("odin@asgard.com")

// Retrieve wisdom when needed
const currentUser = userRealm.get.username()
const userEmail = userRealm.get.email()
```

## 📚 The Three Classes of ODIN

### 1. AutoStorage - The Foundation of All Storage

`AutoStorage` is the cornerstone of ODIN, providing the basic storage functionality that all other classes build upon. Like the roots of Yggdrasil, it forms the foundation of your data storage strategy.

#### Basic AutoStorage Example

```javascript
// Create a storage realm for a blog editor
const blogRealm = new ODIN.AutoStorage("blog-editor", {
    title: {
        settings: { 
            defaultValue: "Untitled Saga", 
            storageType: ODIN.STORAGE_TYPE.LOCAL // Persists like runes carved in stone
        },
    },
    content: {
        settings: { 
            defaultValue: "", 
            storageType: ODIN.STORAGE_TYPE.LOCAL 
        }
    },
    sessionId: {
        settings: {
            storageType: ODIN.STORAGE_TYPE.SESSION, // Temporary like a warrior's battle rage
        }
    },
    draftData: {
        settings: {
            storageType: ODIN.STORAGE_TYPE.MEMORY, // Fleeting like thoughts in battle
        }
    }
})

// Store your epic tales
blogRealm.set.title("The Saga of Ragnarök")
blogRealm.set.content("In the beginning, there was darkness...")
blogRealm.set.sessionId("battle-token-12345")
blogRealm.set.draftData({ lastEdit: Date.now(), wordCount: 1500 })

// Retrieve your stored knowledge
const currentTitle = blogRealm.get.title()
const currentContent = blogRealm.get.content()
const sessionToken = blogRealm.get.sessionId()
```

#### Advanced AutoStorage Features

```javascript
// Storage with validation - ensuring data integrity like the Norns ensure fate
const validatedStorage = new ODIN.AutoStorage("validated-data", {
    age: {
        settings: { 
            defaultValue: 0,
            storageType: ODIN.STORAGE_TYPE.LOCAL 
        },
        validateOnSet: (value) => {
            if (typeof value !== 'number' || value < 0) {
                throw new Error("Age must be a positive number")
            }
        },
        validateOnGet: (value) => {
            if (value > 1000) {
                throw new Error("No mortal should live that long!")
            }
        }
    },
    canBeEmpty: {
        settings: { 
            canBeEmpty: true, // Allows null values like the void before creation
            storageType: ODIN.STORAGE_TYPE.LOCAL 
        }
    }
})

// Dynamic storage type changes - adapting like Loki's shapeshifting
validatedStorage.mutate.age.updateStorageType(ODIN.STORAGE_TYPE.SESSION)

// Check if a key exists in your realm
if (validatedStorage.exists('age')) {
    console.log("The age key exists in this realm")
}

// Get all items as an object - like reading all the runes at once
const allData = validatedStorage.getItemsAsObject()
console.log("All stored knowledge:", allData)
```

### 2. SecretStorage - The Vault of Hidden Knowledge

`SecretStorage` provides encrypted storage, perfect for sensitive data that needs the protection of Odin's wisdom. Like the treasures hidden in Asgard's vaults, your secrets remain safe from prying eyes.

#### Basic SecretStorage Example

```javascript
// Create a vault for sensitive information
const secretVault = new ODIN.SecretStorage("user-secrets", {
    privateKey: {
        settings: { 
            storageType: ODIN.STORAGE_TYPE.LOCAL, 
            defaultValue: "default-secret-key" 
        }
    },
    personalNotes: {
        settings: { 
            storageType: ODIN.STORAGE_TYPE.LOCAL, 
            defaultValue: "My private thoughts..." 
        }
    },
    apiTokens: {
        settings: { 
            storageType: ODIN.STORAGE_TYPE.LOCAL, 
            defaultValue: {} 
        }
    }
})

// Authenticate with your password (like speaking the secret words to open the vault)
const authResult = await secretVault.logIn("your-secret-password")
if (authResult.loggedIn) {
    console.log("Vault opened successfully!")
    
    // Store encrypted secrets
    await secretVault.set.privateKey("super-secret-key-12345")
    await secretVault.set.personalNotes("These are my private thoughts about the gods...")
    await secretVault.set.apiTokens({ 
        github: "ghp_1234567890", 
        discord: "bot_token_xyz" 
    })
    
    // Retrieve decrypted secrets
    const privateKey = await secretVault.get.privateKey()
    const notes = await secretVault.get.personalNotes()
    const tokens = await secretVault.get.apiTokens()
}

// Change your vault password
const passwordChanged = await secretVault.changePassword("old-password", "new-stronger-password")
if (passwordChanged) {
    console.log("Vault password updated successfully!")
}
```

#### Advanced SecretStorage Features

```javascript
// Custom encryption settings - like crafting your own runes
const customCrypt = new ODIN.Crypt()
    .setPassword("my-custom-password")
    .setSalt("custom-salt-like-mimir's-well")
    .setIv("custom-initialization-vector")

// Encrypt individual values
const encryptedValue = await customCrypt.encrypt("sensitive data", "password")
const decryptedValue = await customCrypt.decrypt(encryptedValue, "password")

// Encrypt an entire AutoStorage instance
const regularStorage = new ODIN.AutoStorage("regular-data", {
    data: { settings: { defaultValue: "to be encrypted" } }
})
await customCrypt.encryptStorage(regularStorage)
```

### 3. SuperStorage - The Bridge Between Realms

`SuperStorage` automatically synchronizes your local data with server endpoints, like the Bifröst bridge connecting Asgard to Midgard. It ensures your data flows seamlessly between client and server.

#### Basic SuperStorage Example

```javascript
// Create a super storage that syncs with your server
const serverSync = new ODIN.SuperStorage(
    new ODIN.AutoStorage("user-profile", {
        name: { 
            settings: { 
                storageType: ODIN.STORAGE_TYPE.LOCAL, 
                defaultValue: "Anonymous Warrior" 
            } 
        },
        level: { 
            settings: { 
                storageType: ODIN.STORAGE_TYPE.LOCAL, 
                defaultValue: 1 
            } 
        },
        experience: { 
            settings: { 
                storageType: ODIN.STORAGE_TYPE.LOCAL, 
                defaultValue: 0 
            } 
        }
    }),
    5000, // Sync every 5 seconds (like the regular heartbeat of Yggdrasil)
    async (batch) => {
        // This function is called with data that needs to be sent to the server
        console.log("Sending batch to server:", batch)
        
        try {
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(batch)
            })
            
            if (!response.ok) {
                throw new Error(`Server sync failed: ${response.statusText}`)
            }
            
            console.log("Data successfully synced to server!")
        } catch (error) {
            console.error("Failed to sync with server:", error)
        }
    }
)

// Use the storage normally - changes will be automatically synced
await serverSync.set.name("Thor Odinson")
await serverSync.set.level(99)
await serverSync.set.experience(999999)

// Manually commit specific changes immediately
await serverSync.commit('name') // Forces immediate sync of the 'name' field

// Get all data
const playerName = await serverSync.get.name()
const playerLevel = await serverSync.get.level()
const playerExp = await serverSync.get.experience()
```

#### Advanced SuperStorage Features

```javascript
// SuperStorage with SecretStorage for encrypted server sync
const encryptedServerSync = new ODIN.SuperStorage(
    new ODIN.SecretStorage("encrypted-user-data", {
        privateData: { 
            settings: { 
                storageType: ODIN.STORAGE_TYPE.LOCAL, 
                defaultValue: "encrypted by default" 
            } 
        }
    }),
    10000, // Sync every 10 seconds
    async (batch) => {
        // Send encrypted data to server
        const response = await fetch('/api/encrypted-sync', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken()
            },
            body: JSON.stringify(batch)
        })
        return response.json()
    }
)

// Control the sync interval dynamically
encryptedServerSync.startInterval(2000) // Change to sync every 2 seconds
encryptedServerSync.killInterval() // Stop automatic syncing

// Commit all pending changes manually
await encryptedServerSync.commitAll()
```

## 🛠️ Storage Types - The Three Realms

ODIN supports three storage types, each with its own characteristics:

### `ODIN.STORAGE_TYPE.LOCAL`
- **Persistence**: Survives browser restarts
- **Scope**: Per domain
- **Use Case**: Long-term data storage
- **Nordic Reference**: Like runes carved in stone - permanent and lasting

### `ODIN.STORAGE_TYPE.SESSION`
- **Persistence**: Survives page refreshes but not browser restarts
- **Scope**: Per tab/window
- **Use Case**: Temporary data for the current session
- **Nordic Reference**: Like a warrior's battle rage - powerful but temporary

### `ODIN.STORAGE_TYPE.MEMORY`
- **Persistence**: Lost on page refresh
- **Scope**: Per page load
- **Use Case**: Temporary calculations and caching
- **Nordic Reference**: Like thoughts in Odin's mind - present but fleeting

## 🎯 Real-World Examples

### Example 1: E-commerce Shopping Cart

```javascript
// Shopping cart that persists across sessions
const shoppingCart = new ODIN.AutoStorage("shopping-cart", {
    items: {
        settings: { 
            defaultValue: [], 
            storageType: ODIN.STORAGE_TYPE.LOCAL 
        }
    },
    total: {
        settings: { 
            defaultValue: 0, 
            storageType: ODIN.STORAGE_TYPE.LOCAL 
        }
    },
    currency: {
        settings: { 
            defaultValue: "USD", 
            storageType: ODIN.STORAGE_TYPE.LOCAL 
        }
    }
})

// Add items to cart
const addToCart = (product) => {
    const currentItems = shoppingCart.get.items()
    const updatedItems = [...currentItems, product]
    shoppingCart.set.items(updatedItems)
    
    // Update total
    const newTotal = updatedItems.reduce((sum, item) => sum + item.price, 0)
    shoppingCart.set.total(newTotal)
}

// Clear cart
const clearCart = () => {
    shoppingCart.set.items([])
    shoppingCart.set.total(0)
}
```

### Example 2: User Preferences with Server Sync

```javascript
// User preferences that sync with server
const userPrefs = new ODIN.SuperStorage(
    new ODIN.AutoStorage("user-preferences", {
        theme: {
            settings: { 
                defaultValue: "light", 
                storageType: ODIN.STORAGE_TYPE.LOCAL 
            }
        },
        language: {
            settings: { 
                defaultValue: "en", 
                storageType: ODIN.STORAGE_TYPE.LOCAL 
            }
        },
        notifications: {
            settings: { 
                defaultValue: true, 
                storageType: ODIN.STORAGE_TYPE.LOCAL 
            }
        }
    }),
    30000, // Sync every 30 seconds
    async (batch) => {
        await fetch('/api/user-preferences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batch)
        })
    }
)

// Apply theme changes
const applyTheme = async (theme) => {
    await userPrefs.set.theme(theme)
    document.body.className = `theme-${theme}`
}

// Toggle notifications
const toggleNotifications = async () => {
    const current = await userPrefs.get.notifications()
    await userPrefs.set.notifications(!current)
}
```

### Example 3: Secure User Session Management

```javascript
// Secure session management with encryption
const secureSession = new ODIN.SecretStorage("user-session", {
    userId: {
        settings: { 
            storageType: ODIN.STORAGE_TYPE.LOCAL, 
            defaultValue: null 
        }
    },
    sessionToken: {
        settings: { 
            storageType: ODIN.STORAGE_TYPE.LOCAL, 
            defaultValue: null 
        }
    },
    lastActivity: {
        settings: { 
            storageType: ODIN.STORAGE_TYPE.LOCAL, 
            defaultValue: Date.now() 
        }
    }
})

// Login function
const login = async (username, password) => {
    try {
        // Authenticate with server
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        
        const { userId, sessionToken } = await response.json()
        
        // Store encrypted session data
        await secureSession.logIn(password)
        await secureSession.set.userId(userId)
        await secureSession.set.sessionToken(sessionToken)
        await secureSession.set.lastActivity(Date.now())
        
        return true
    } catch (error) {
        console.error("Login failed:", error)
        return false
    }
}

// Check if user is logged in
const isLoggedIn = async () => {
    try {
        const authResult = await secureSession.authenticate("user-password")
        return authResult.loggedIn
    } catch {
        return false
    }
}
```

## 🔧 API Reference

### AutoStorage Constructor
```javascript
new ODIN.AutoStorage(namespace, itemInitCollection)
```

**Parameters:**
- `namespace` (string): Unique identifier for the storage instance
- `itemInitCollection` (object): Configuration for each storage item

**Item Configuration:**
```javascript
{
    itemName: {
        settings: {
            storageType: ODIN.STORAGE_TYPE.LOCAL | SESSION | MEMORY,
            defaultValue: any,
            canBeEmpty: boolean
        },
        validateOnSet: (value) => { /* validation logic */ },
        validateOnGet: (value) => { /* validation logic */ }
    }
}
```

### SecretStorage Constructor
```javascript
new ODIN.SecretStorage(namespace, itemInitCollection)
```

**Methods:**
- `logIn(password)`: Authenticate and unlock the vault
- `authenticate(password)`: Check if password is correct
- `changePassword(oldPassword, newPassword)`: Update the vault password

### SuperStorage Constructor
```javascript
new ODIN.SuperStorage(storage, interval, postToServer)
```

**Parameters:**
- `storage`: AutoStorage or SecretStorage instance
- `interval`: Sync interval in milliseconds
- `postToServer`: Function to handle server synchronization

**Methods:**
- `commit(key)`: Manually sync a specific item
- `commitAll()`: Sync all pending changes
- `startInterval(interval)`: Start/restart auto-sync
- `killInterval()`: Stop auto-sync

## 🎨 Best Practices

### 1. Choose the Right Storage Type
```javascript
// Use LOCAL for persistent data
const userSettings = new ODIN.AutoStorage("settings", {
    theme: { settings: { storageType: ODIN.STORAGE_TYPE.LOCAL } }
})

// Use SESSION for temporary data
const tempData = new ODIN.AutoStorage("temp", {
    formData: { settings: { storageType: ODIN.STORAGE_TYPE.SESSION } }
})

// Use MEMORY for calculations
const calculations = new ODIN.AutoStorage("calc", {
    cache: { settings: { storageType: ODIN.STORAGE_TYPE.MEMORY } }
})
```

### 2. Implement Proper Error Handling
```javascript
try {
    const value = storage.get.someKey()
    console.log("Retrieved value:", value)
} catch (error) {
    if (error instanceof ODIN.AutoStorageNullValueError) {
        console.log("Value not found, using default")
    } else {
        console.error("Unexpected error:", error)
    }
}
```

### 3. Use Validation for Data Integrity
```javascript
const validatedStorage = new ODIN.AutoStorage("validated", {
    email: {
        settings: { defaultValue: "" },
        validateOnSet: (value) => {
            if (!value.includes('@')) {
                throw new Error("Invalid email format")
            }
        }
    }
})
```

## 🌟 Conclusion

ODIN brings the wisdom of the Norse gods to modern web development, providing a powerful, flexible, and secure way to manage client-side storage. Whether you're building a simple web app or a complex enterprise application, ODIN has the tools you need to store, secure, and synchronize your data with the elegance of the ancient runes.

*"May your data flow as smoothly as the mead in Valhalla, and may your storage be as secure as Odin's vaults!"*

---

## 🌐 Browser Compatibility

ODIN supports all modern browsers with the following minimum requirements:

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 11+
- **Edge**: 79+
- **Internet Explorer**: Not supported (uses modern Web Crypto API)

### Required Browser APIs

- `localStorage` and `sessionStorage`
- `window.crypto.subtle` (for encryption features)
- `JSON.stringify` and `JSON.parse`
- `Promise` (for async operations)

## 📦 Package Information

**Version**: 1.0.0  
**License**: MIT  
**Size**: ~15KB minified, ~5KB gzipped  
**Repository**: [Your Repository URL]  
**Documentation**: [Your Documentation URL]  
**NPM**: `npm install odin-storage`
