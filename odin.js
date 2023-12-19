// On-Demand Information Nexus
const ODIN = (() => {

    class AutoStorageNullValueError extends Error {
        autoStorageKey = ""
        constructor(autoStorageKey) {
            const message = `Value for key ${autoStorageKey} is null`
            super(message)
            this.name = AutoStorageNullValueError.name
            this.autoStorageKey = autoStorageKey
        }
    }


    class AutoStorage {
        static STORAGE_TYPE = {
            MEMORY: "memory",
            SESSION: "session",
            LOCAL: "local",
        }

        static nullthrows(nullable, error, onlyCheckForNull = false) {
            if (onlyCheckForNull && nullable === null) {
                throw error
            }
            if (nullable === null || nullable === undefined) {
                throw error
            }
            return nullable
        }



        /** used when we do not want to persist data in local storage. */
        unstableStorage = {}

        /** remember the object's name. used to add new items after object creation*/
        namespace = null
        /**
         * Used for custom handling when getting an object from AutoStorage
         * @callback validateOnGet
         * @param {any} value
         * @throws when the validation fails
         */
        /**
         * Used for custom handling when setting an object from AutoStorage
         * @callback validateOnSet
         * @param {any} value
         * @throws when the validation fails
         */

        /**
         * @typedef { {
         * canBeEmpty: boolean,
         * storageType: AutoStorage.STORAGE_TYPE,
         * defaultValue: *,
         * }} Settings
         */

        /**
         * @typedef {{
         *  settings: Settings,
         *  validateOnGet: validateOnGet,
         *  validateOnSet: validateOnSet,
         * }} ItemInitParams
         */

        /**
         * @typedef {{[x: string]: ItemInitParams}} ItemInitCollection
         */

        /**
         * @typedef {(value: any)=>void} Setter
         */

        /**
         * The object containing all of the setter methods for the values you are persisting
         * in AutoStorage.
         * @type {{[key in ItemInitCollection]: Setter}}
         */
        set = {}


        /**
         * The object containing all of the getter methods for the values you are persisting
         * in AutoStorage.
         * @type {{[x: string]: ()=>any}}
         */
        get = {}

        /** @type {{[x: string]: Settings}} */
        settings = {}

        /**
         * a object that stores the name of the getter/setter to then act upon it. 
         * example: `BookStorage.bookSettings.actOn.deploymentId.updateStorageType("local")`
         * will update the storage type to "local" for the attribute `deploymentId`.  
         */
        mutate = {}

        SETTINGS_FOR_THE_CLASS_SETTINGS = { storageType: AutoStorage.STORAGE_TYPE.LOCAL }
        /**
         * @param {string} namespace the name of the storage object. This is used to keep track of 
         * attributes with the same name but in different AutoStorage objects.
         * @param {ItemInitCollection} obj an array of tuples, where the first 
         * value is the name of getter / setter of the attribute, and the second value is a settings 
         * object which can be undefined if the attribute using the default settings.
         */
        constructor(namespace, obj) {
            this.namespace = namespace
            for (const [name, params] of Object.entries(obj)) {
                this.#initializeItem(name, params)
            }
            // persist the settings object in local storage
            this.setItem(this.settingsKey(), JSON.stringify(this.settings), this.SETTINGS_FOR_THE_CLASS_SETTINGS)
        }

        /**
         * Private. Sets up one key-value pair.
         * @param {string} name 
         * @param {ItemInitParams} params  
         */
        #initializeItem(name, params) {
            this.#initSettingsForItem(name, params)
            this.set[name] = this.makeSetter(name, params)
            this.get[name] = this.makeGetter(name, params)
            this.mutate[name] = this.makeMutator(name)
            if (params.settings?.defaultValue !== undefined) {
                this.setDefaultValueForItem(name)
            }
        }

        // ------------------------------ SETTERS, GETTERS, & MUTATORS ------------------------------

        /**
         * returns the setter method for an item
         * @param {string} name 
         * @param {ItemInitParams} params 
         * @returns 
         */
        makeSetter(name, params) {
            return value => {
                return this.setItem(
                    this.itemKey(name),
                    JSON.stringify(value),
                    this.settings[name],
                    params.validateOnSet
                )
            }
        }

        /**
         * returns the getter method for an item
         * @param {string} name 
         * @param {ItemInitParams} params 
         * @returns 
         */
        makeGetter(name, params) {
            return () => {
                try {
                    const item = this.getItem(this.itemKey(name), this.settings[name])
                    return this.validateItem(item, this.itemKey(name), this.settings[name], params.validateOnGet, this.settings[name].canBeEmpty)
                } catch (error) {
                    if (error instanceof AutoStorageNullValueError) {
                        if (this.settings[name]?.canBeEmpty) {
                            return null
                        }
                    }
                    throw error
                }
            }
        }

        /**
         * returns the mutator method for an item
         * @param {string} name 
         * @returns 
         */
        makeMutator(name) {
            const key = this.itemKey(name)
            return {
                updateStorageType: (storageTypeString) => {
                    // get the value BEFORE we remove it (and it's key)
                    try {
                        const valueFromOldStorageSystem = this.get[name]()
                        this.removeItem(key, this.settings[name])
                        this.settings[name].storageType = storageTypeString
                        this.set[name](valueFromOldStorageSystem)
                    } catch (error) {
                        if (!(error instanceof AutoStorageNullValueError)) {
                            throw error
                        }
                    } finally {
                        this.settings[name].storageType = storageTypeString
                        // now we change the storage type to what we want. Then 
                        // we call the setter as normal
                        this.setItem(this.settingsKey(), JSON.stringify(this.settings), this.SETTINGS_FOR_THE_CLASS_SETTINGS)
                    }


                },
                delete: () => this.removeItem(key, this.settings[name]),
            }
        }

        // ------------------------------------------------------------------------------------------

        /**
         * Override this method to customize your settings key
         * @param {string} namespace 
         * @returns 
         */
        settingsKey() {
            return `${this.namespace}.__AutoStorage_Settings__`
        }

        /**
         * 
         * @param {string} name 
         * @param {ItemInitParams} params 
         */
        #initSettingsForItem(name, params) {
            const savedSettings = this.#getSettings(this.SETTINGS_FOR_THE_CLASS_SETTINGS) || {}
            this.settings[name] = savedSettings[name] || params.settings || {}
        }

        /**
         * Returns the storage key (session or local) for a given item's name. 
         * @param {string} name the name of an item stored in AutoStorage
         * @returns 
         */
        itemKey(name) {
            return `${this.namespace}.${name}`
        }

        /**
         * Override this method for customize how the item will be given a default value
         * @param {string} name the name of an item stored in AutoStorage
         */
        setDefaultValueForItem(name) {
            try {
                this.get[name]() // if this throws then we need to put in the default value
            } catch (error) {
                if (error instanceof AutoStorageNullValueError) {
                    this.set[name](this.settings[name]?.defaultValue) // putting in the default value
                } else {
                    throw error
                }
            }
        }

        /**
         * Private. Gets the the given key-value.
         * @param {string} key 
         * @param {Settings} settings 
         * @param {validateOnGet} validateOnGet  
         * @param {boolean} doNotThrowIfNull only for internal use 
         * @returns {string}
         */
        getItem(key, settings) {
            return this.getItemFromStorage(key, settings)
        }

        #getSettings(settingsForTheClassSettings) {
            const item = this.getItemFromStorage(this.settingsKey(), settingsForTheClassSettings)
            try {
                return JSON.parse(item)
            } catch (e) {
                return settingsForTheClassSettings.defaultValue
            }
        }

        /**
         * gets the value from the storage container. Will always return a string
         * @param {string} key 
         * @param {Settings} settings 
         * @returns {string}
         */
        getItemFromStorage(key, settings) {
            let item
            switch (settings?.storageType) {
                case AutoStorage.STORAGE_TYPE.MEMORY:
                    item = this.unstableStorage[key]
                    break
                case AutoStorage.STORAGE_TYPE.SESSION:
                    item = sessionStorage.getItem(key)
                    break
                default:
                    item = localStorage.getItem(key)
                    break
            }
            return item
        }

        /**
         * @param {string} item 
         * @param {string} key 
         * @param {Settings} settings 
         * @param {validateOnGet*} validateOnGet 
         * @param {boolean} doNotThrowIfNull 
         * @returns {any} 
         */
        validateItem(item, key, settings, validateOnGet = undefined, doNotThrowIfNull = false) {
            if (typeof validateOnGet === 'function') {
                // we can let the developer decide how to handle getting an item
                item = JSON.parse(item)
                validateOnGet(item)
                return item
            } else if (doNotThrowIfNull) {
                // this is only when we explicity do not care what the value is
                try {
                    return JSON.parse(item)
                } catch (e) {
                    return settings.defaultValue
                }
            } else {
                // otherwise, use the default validation
                const raw_value = AutoStorage.nullthrows(item, new AutoStorageNullValueError(key))
                // now try to parse the value, if it fails, the token has not decrypted the value correctly.
                try {
                    return JSON.parse(raw_value)
                } catch (e) {
                    console.warn("unable to parse raw_value. Using default value instead")
                    return settings.defaultValue
                }

            }
        }

        /**
         * Private. Sets the the given key-value.
         * @param {string} key 
         * @param {string} rawValue json string of value
         * @param {Settings} settings 
         * @param {validateOnSet} validateOnSet 
         */
        setItem(key, value, settings, validateOnSet) {
            if (typeof validateOnSet === "function") {
                validateOnSet(value)
            }
            if (typeof settings.onSet === "function") {
                settings.onSet(value)
            }

            switch (settings?.storageType) {
                case AutoStorage.STORAGE_TYPE.MEMORY:
                    this.unstableStorage[key] = value
                    break
                case AutoStorage.STORAGE_TYPE.SESSION:
                    sessionStorage.setItem(key, value)
                    break
                default:
                    localStorage.setItem(key, value)
                    break
            }

            return value
        }

        /**
         * Removes the given key-value.
         * @param {string} key 
         * @param {Settings} settings 
         * @returns 
         */
        removeItem(key, settings) {
            switch (settings?.storageType) {
                case AutoStorage.STORAGE_TYPE.MEMORY:
                    delete this.unstableStorage[key]
                    return
                case AutoStorage.STORAGE_TYPE.SESSION:
                    return sessionStorage.removeItem(key)
                default:
                    return localStorage.removeItem(key)
            }
        }
        /**
         * Report if a key exists.
         * @param {string} name 
         * @returns
         */
        exists(name) {
            return this.set[name] !== undefined
        }
        /**
         * adds a new key-value.
         * @deprecated Do not use this. Will be removed soon.
         * @param {string} name 
         * @param {object} params  
         */
        addItem(name, params = { settings: {} }) {
            const settingsForTheClassSettings = { storageType: AutoStorage.STORAGE_TYPE.LOCAL, encrypt: false, localOnly: true }
            const settingsKey = this.settingsKey(this.namespace)
            const new_params = JSON.parse(JSON.stringify(params))
            if (!new_params.settings.storageType) {
                if (this.isPrivateComputer()) {
                    new_params.settings.storageType = AutoStorage.STORAGE_TYPE.LOCAL
                } else {
                    new_params.settings.storageType = AutoStorage.STORAGE_TYPE.SESSION
                }
            }
            this.#initializeItem(this.namespace, name, new_params, settingsForTheClassSettings, settingsKey)

            // persist the settings object in local storage
            this.setItem(settingsKey, JSON.stringify(this.settings), settingsForTheClassSettings)

        }

        /**
         * Changes the storage type for all items
         * @param {AutoStorage.STORAGE_TYPE} storageType 
         */
        updateStorageType(storageType) {
            //moves all items to the specified storage time (e.g. local or session)
            for (const key of this.getKeys()) {
                this.mutate[key].updateStorageType(storageType)
            }
        }

        /**
         * returns the set of keys in the namespace
         */
        getKeys() {
            return Object.keys(this.mutate)
        }

        /**
         * Gets all the items from the `get` object. 
         * the key is the key-name from the get, and 
         * the value is the actual value
         * @returns 
         */
        getItemsAsObject() {
            const obj = {}
            for (const key of this.getKeys()) {
                try {
                    const value = this.get[key]()
                    obj[key] = value
                } catch (_) {
                    // throws if null, which is fine is this context
                }
            }
            return obj
        }

    }

    class Crypt {
        salt = encode("Shall we sin on still impenitent and incorrigible?")
        iv = encode("WE MUST ASSERT OUR RIGHTFUL CLAIMS AND PLEAD OUR OWN CAUSE")
        password = null

        getKeyMaterial(password) {
            return window.crypto.subtle.importKey(
                "raw",
                encode(password),
                { name: "PBKDF2" },
                false,
                ["deriveBits", "deriveKey"]
            );
        }

        getKey(keyMaterial) {
            return window.crypto.subtle.deriveKey(
                {
                    "name": "PBKDF2",
                    salt: this.salt,
                    "iterations": 100000,
                    "hash": "SHA-256"
                },
                keyMaterial,
                { "name": "AES-GCM", "length": 256 },
                true,
                ["encrypt", "decrypt"]
            );
        }

        /**
         * 
         * @param {string} str 
         * @returns {Promise<string>}
         */
        async encrypt(str, password) {
            if (!password) {
                console.warn("no password set! Not going to encrypt.");
                return str
            }
            const keyMaterial = await this.getKeyMaterial(password);
            const key = await this.getKey(keyMaterial, this.salt);
            const encoded = encode(str)

            const arrBuf = await window.crypto.subtle.encrypt(
                {
                    name: "AES-GCM",
                    iv: this.iv
                },
                key,
                encoded
            );

            return decode(arrBuf)
        }

        /**
         * 
         * @param {string} str 
         * @returns {Promise<string>}
         */
        async decrypt(str, password) {
            if (!password) {
                console.warn("No password set! Not going to decrypt.");
                return str
            }

            const keyMaterial = await this.getKeyMaterial(password);
            const key = await this.getKey(keyMaterial, this.salt);

            const decrypted = await window.crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: this.iv
                },
                key,
                encode(str)
            );

            return decode(decrypted)
        }

        setSalt(str) {
            this.salt = encode(str)
            return this
        }

        setIv(str) {
            this.iv = encode(str)
            return this
        }

        setPassword(newPassword) {
            this.password = newPassword
            return this
        }

        /**
         * encrypts the entire autoStorage 
         * @param {AutoStorage} autoStorage 
         */
        async encryptStorage(autoStorage) {
            const proms = []
            for (const key of autoStorage.getKeys()) {
                proms.push(this.encryptItem(autoStorage, key))
            }
            await Promise.all(proms)
        }

        async encryptItem(autoStorage, key) {
            try {
                await this.encryptValue(autoStorage.set[key], autoStorage.get[key]())
            } catch (error) {
                if (error instanceof AutoStorageNullValueError) {
                    // Do not do anything, it's ok to not encrypt something that
                    // is not there. 
                } else {
                    throw error
                }
            }
        }

        async encryptValue(setter, value) {
            setter(await this.encrypt(JSON.stringify(value), this.password))
        }

        async decryptItem(getter) {
            const res = JSON.parse(await this.decrypt(getter(), this.password))
            return res
        }

        async decryptWithTestPassword(getter, password) {
            return JSON.parse(await this.decrypt(getter(), password))
        }
    }


    function encode(str) {
        return str2ab(str)
    }

    function decode(buffer) {
        return ab2str(buffer)
    }


    function ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint16Array(buf));
    }

    function str2ab(str) {
        var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        var bufView = new Uint16Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }


    class SecretStorage {
        #auth
        #storage
        #crypt
        #defaultPassword = "shall we sin on still impenitent"
        get = {}
        set = {}
        mutate = {}
        namespace
        /**
         * @param {string} namespace 
         * @param {ItemInitCollection} obj 
         */
        constructor(namespace, obj) {
            this.namespace = namespace
            this.#crypt = new Crypt().setPassword(this.#defaultPassword) // figure out how to set password
            this.#auth = new AutoStorage(`${namespace} >:)`, { token: { settings: { defaultValue: "is_logged_in" } } })
            this.#storage = new AutoStorage(namespace, obj)

            if (this.#auth.get.token() === 'is_logged_in') {
                // we need to encrypt on the first time
                this.#lockUp(this.#auth)
                this.#lockUp(this.#storage)
            }

            for (const key of this.#storage.getKeys()) {
                this.get[key] = async () => {
                    return await this.#crypt.decryptItem(this.#storage.get[key])
                }
                this.set[key] = async (value) => {
                    await this.#crypt.encryptValue(this.#storage.set[key], value)
                }
                this.mutate[key] = this.#storage.mutate[key]
            }

        }

        /**
         * Encrypts the values in the AutoStorage instance. Be
         * carful! There is nothing stopping you from double 
         * encrypting values
         * @param {AutoStorage} storage 
         */
        async #lockUp(autoStorage) {
            await this.#crypt.encryptStorage(autoStorage)
        }

        /**
         * Lets us know if the supplied password was the users password, or
         * if the user has not set a password yet 
         * @param {string} password 
         * @returns 
         */
        async authenticate(password) {
            let testValue
            try {
                testValue = await this.#crypt.decryptWithTestPassword(this.#auth.get.token, password)
            } catch (_) {
                testValue = undefined
            }
            if (testValue === "is_logged_in") {
                // This is the right password great!
                return {
                    loggedIn: true,
                    usingDefaultPassword: false
                }
            } else {
                try {
                    const testValue = await this.#crypt.decryptWithTestPassword(this.#auth.get.token, this.#defaultPassword)
                    if (testValue === "is_logged_in") {
                        // No password was set. Had to use the default password.
                        return {
                            loggedIn: true,
                            usingDefaultPassword: true
                        }
                    }
                    return {
                        loggedIn: false,
                        usingDefaultPassword: false
                    }
                } catch (_) {
                    // this is the wrong password
                    return {
                        loggedIn: false,
                        usingDefaultPassword: false
                    }
                }
            }
        }

        /**
         * Attempts to log the user in. 
         * @param {string} password 
         * @returns 
         */
        async logIn(password) {
            const result = await this.authenticate(password)
            if (result.loggedIn && !result.usingDefaultPassword) {
                this.#crypt.setPassword(password)
            } else if (result.loggedIn && result.usingDefaultPassword) {
                // We can change the default password to the users entered 
                // password if we want to
                await this.#updateWithPassword(this.#defaultPassword, password)
            }
            return result
        }

        /**
         * Allow the user to change their password
         * @param {string} oldPassword 
         * @param {string} newPassword 
         * @returns 
         */
        async changePassword(oldPassword, newPassword) {
            const result = await this.authenticate(oldPassword)
            if (result.loggedIn) {
                await this.#updateWithPassword(oldPassword, newPassword)
            }
            return result.loggedIn
        }

        /**
         * 1. decrypt all values with old password 
         * 2. set the new password 
         * 3. encrypt all values
         * @param {string} oldPassword the password that should decrypt the values
         * @param {string} newPassword the user's new password
         */
        async #updateWithPassword(oldPassword, newPassword) {
            this.#crypt.setPassword(oldPassword)
            const authToken = await this.#crypt.decryptItem(this.#auth.get.token)
            const gets = []
            for (const key of this.#storage.getKeys()) {
                gets.push({ key, value: await this.get[key]() })
            }
            const obj = {}
            gets.forEach(item => {
                obj[item.key] = item.value
            })

            this.#crypt.setPassword(newPassword)
            this.#crypt.encryptValue(this.#auth.set.token, authToken)
            const promises = []
            for (const [key, value] of Object.entries(obj)) {
                promises.push(this.set[key](value))
            }
            await Promise.all(promises)
        }

        getKeys() {
            return this.#storage.getKeys()
        }
    }

    class SuperStorage {
        get = {}
        set = {}
        mutate = {}
        batch = {}
        serverPost
        storage
        commitTracker

        /**
         * 
         * @param {AutoStorage | SecretStorage} storage
         */
        constructor(storage, interval,  postToServer = (batch) => console.warn("mock call to post to server", batch)) {
            this.storage = storage
            this.commitTracker = this.createCommitTracker()
            this.serverPost = postToServer
            for (const key of this.storage.getKeys()) {
                this.get[key] = async () => {
                    return await this.storage.get[key]()
                }
                this.set[key] = async (value) => {
                    this.commitTracker.set[key](true) // needs to be updated
                    await this.storage.set[key](value)
                }
                this.mutate[key] = this.storage.mutate[key]

            }
            this.startInterval(interval)
        }

        /**
         * Kills the interval that us automatically publishing
         */
        killInterval(){
            clearInterval(this.intervalId)
        }

        /**
         * Kills (if present) and then starts a new interval
         * @param {number} interval 
         */
        startInterval(interval){
            this.killInterval()
            this.intervalId = setInterval(() => {
                this.commitAll()
            }, interval);
        }

        /**
         * creates an auto storage object used for keeping track 
         * of values that need to be committed.
         * @returns {AutoStorage}
         */
        createCommitTracker() {
            const obj = {}
            for (const key of this.storage.getKeys()) {
                obj[key] = {
                    settings: { storageType: AutoStorage.STORAGE_TYPE, defaultValue: false }
                }
            }
            return new AutoStorage(`${this.storage.namespace}_commit_tracker`, obj)
        }

        /**
         * Commits all values that have not been committed since they
         * were updated
         */
        commitAll = async () => {
            const batch = []
            for (const [key, value] of Object.entries(this.commitTracker.getItemsAsObject())) {
                if (value) {
                    batch.push({ id: key, value: await this.storage.get[key]() })
                    this.commitTracker.set[key](false)
                }
            }
            if (batch.length > 0) {
                this.serverPost(batch)
            }
        }

        /**
         * Commits a specific value by the given key. Will commit regardless
         * of if the value has changed or not.
         * @param {string} key the key for the value stored in the `storage` attribute
         */
        commit = async (key) => {
            const batch = []
            batch.push({ id: key, value: await this.storage.get[key]() })
            this.commitTracker.set[key](false)
            this.serverPost(batch)
        }
    }


    return {
        STORAGE_TYPE: AutoStorage.STORAGE_TYPE,
        AutoStorage,
        SecretStorage,
        SuperStorage,
        Crypt,
    }

})()