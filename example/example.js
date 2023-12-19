const storage = new ODIN.AutoStorage("secret-tests", {
    username: {
        settings: { defaultValue: "eaallen", },
    },
    email: { settings: { defaultValue: "fake@fave.com" } },
    password1: {
        settings: {
            storageType: ODIN.STORAGE_TYPE.SESSION,
        }
    },
})

const eli = new ODIN.AutoStorage("eli", {
    name: {}
})

let secrets = new ODIN.SuperStorage(new ODIN.AutoStorage("what-you-want", {
    age: { settings: { storageType: ODIN.STORAGE_TYPE.LOCAL, defaultValue: 26 } },
    gender: { settings: { storageType: ODIN.STORAGE_TYPE.LOCAL, defaultValue: {identity: 'male', real: 'male'} } },
    weight: { settings: { storageType: ODIN.STORAGE_TYPE.LOCAL, defaultValue: 196 } },
}), 20*1000, (data)=> console.warn("data---->", data))
