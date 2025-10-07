
/**
 * Hamburger button creation
 */

const btn = document.querySelector(".menu-toggle");
const menu = document.querySelector("nav-menu");

//EventListener for click
btn.addEventListener("click", () => {
    //When the hamburger menu icon is clicked, it toggles
    menu.classList.toggle("active");
})

//The horizontal menu closes when another click is made
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        menu.classList.remove("active");
    })
})


/**
 * User auth functionality
 * STORAGE_USER_KEYS is the key for the users in the local storage
 * STORAGE_CURRENT_KEY is the key for the current user in the local storage
 */
const STORAGE_USERS_KEY = "lp_users"
const STORAGE_CURRENT_KEY = "lp_current_user"


/**
 * Reads users from the local storage
 * @returns users from the local storage
 */
function readUsers() {
    const raw = localStorage.getItem(STORAGE_USERS_KEY)
    if (!raw) return []
    try { return JSON.parse(raw) || [] } catch { return [] }
}

/**
 * Writes user to the local storage
 * @param {*} users 
 */

function writeUsers(users) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users))
}

/**
 * Gets the current authenticated user
 * @returns 
 */

function getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_CURRENT_KEY)
    if (!raw) return null
    try { return JSON.parse(raw) } catch { return null }
}

/**
 * Sets the current authenticated user
 * @param {*} user 
 * @returns 
 */

function setCurrentUser(user) {
    if (!user) { localStorage.removeItem(STORAGE_CURRENT_KEY); return }
    localStorage.setItem(STORAGE_CURRENT_KEY, JSON.stringify(user))
}

/**
 * Checks if the user is authenticated
 * @returns true if the user is authenticated, false otherwise
 */

function isAuthenticated() {
    return !!getCurrentUser()
}

/**
 * Handles the authentication actions
 * @param {*} action 
 * @param {*} data 
 * @returns 
 */

function auth(action, data = {}) {
    if (action === "register") {
        const { email, password, name } = data
        if (!email || !password) return { ok: false, error: "Datos incompletos" }
        const users = readUsers()
        const exists = users.some(u => u.email.toLowerCase() === String(email).toLowerCase())
        if (exists) return { ok: false, error: "El usuario ya existe" }
        const user = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), email, name: name || "", password }
        users.push(user)
        writeUsers(users)
        setCurrentUser({ id: user.id, email: user.email, name: user.name })
        return { ok: true, user: getCurrentUser() }
    }
    if (action === "login") {
        const { email, password } = data
        if (!email || !password) return { ok: false, error: "Datos incompletos" }
        const users = readUsers()
        const found = users.find(u => u.email.toLowerCase() === String(email).toLowerCase())
        if (!found) return { ok: false, error: "Usuario no encontrado" }
        if (found.password !== password) return { ok: false, error: "Credenciales inválidas" }
        setCurrentUser({ id: found.id, email: found.email, name: found.name || "" })
        return { ok: true, user: getCurrentUser() }
    }
    if (action === "logout") {
        setCurrentUser(null)
        return { ok: true }
    }
    if (action === "status") {
        return { ok: true, authenticated: isAuthenticated(), user: getCurrentUser() }
    }
    return { ok: false, error: "Acción no soportada" }
}

/**
 * Exports the auth function
 */
window.auth = auth
window.isAuthenticated = isAuthenticated
window.getCurrentUser = getCurrentUser