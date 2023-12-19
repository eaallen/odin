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