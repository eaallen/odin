# ODIN: On-Demand Information Nexus

ODIN is a library to make working with local, session or in memory storage simple and maintainable. It's declarative initialization process makes it clear how each value will be used. 

Storing data on the client has never been easier:

```javascript
const storage = new ODIN.AutoStorage("user-details", {
    username: {
        settings: { defaultValue: "testUser", },
    },
    email: { settings: { defaultValue: "fake@fave.com" } },
    password1: {
        settings: {
            storageType: ODIN.STORAGE_TYPE.MEMORY,
        }
    },
})
```

Want to automatically push values from ODIN to some backend process? Now you can:

```javascript
const secrets = new ODIN.SuperStorage(new ODIN.SecretStorage("what-you-want", {
    age: { settings: { storageType: ODIN.STORAGE_TYPE.LOCAL, defaultValue: 26 } },
    gender: { settings: { storageType: ODIN.STORAGE_TYPE.LOCAL, defaultValue: {identity: 'male', real: 'male'} } },
    weight: { settings: { storageType: ODIN.STORAGE_TYPE.LOCAL, defaultValue: 196 } },
}), 20*1000, (data)=> console.warn("sending data data---->", data))
```

## Usage

Download the `odin.js` file and add it to your project. Once you do you will have access to the ODIN namespace, which has three main classes you can use:

1. `AutoStorage`
2. `SecretStorage`
3. `SuperStorage`

### Using AutoStorage 

`AutoStorage` is the basic class, and is key to all other parts of ODIN. You create an instance of auto storage in this way:

```javascript
const storage = new ODIN.AutoStorage(namespace, keys)
```
where `namespace` is a unique name, `keys` is an object the describes how your data will be stored. 

```javascript
const storage = new ODIN.AutoStorage("blog-editor-example", {
    title: {
        settings: { defaultValue: "Untitled", }, // if you don't set the storage type, LOCAL will be used.
    },
    content: {settings: { defaultValue: "", }},
    sessionId: {
        settings: {
            storageType: ODIN.STORAGE_TYPE.SESSION,
        }
    },
})

// setting values
storage.set.title("Hello World")
storage.set.content("lorem ipsum")
storage.set.sessionId("qwe-1234234rwe-3fwef-13")

// getting values
storage.get.title()
storage.get.content()
storage.get.sessionId()

```