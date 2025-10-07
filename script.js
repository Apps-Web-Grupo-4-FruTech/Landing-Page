
/**
 * Hamburger button creation
 */

const btn = document.querySelector(".menu-toggle");
const menu = document.querySelector(".nav-menu");

//EventListener for click
if (btn && menu) {
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
}


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
function lpReadUsers() {
    const raw = localStorage.getItem(STORAGE_USERS_KEY)
    if (!raw) return []
    try { return JSON.parse(raw) || [] } catch { return [] }
}

/**
 * Writes user to the local storage
 * @param {*} users 
 */

function lpWriteUsers(users) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users))
}

/**
 * Gets the current authenticated user
 * @returns 
 */

function lpGetCurrentUser() {
    const raw = localStorage.getItem(STORAGE_CURRENT_KEY)
    if (!raw) return null
    try { return JSON.parse(raw) } catch { return null }
}

/**
 * Sets the current authenticated user
 * @param {*} user 
 * @returns 
 */

function lpSetCurrentUser(user) {
    if (!user) { localStorage.removeItem(STORAGE_CURRENT_KEY); return }
    localStorage.setItem(STORAGE_CURRENT_KEY, JSON.stringify(user))
}

/**
 * Checks if the user is authenticated
 * @returns true if the user is authenticated, false otherwise
 */

function lpIsAuthenticated() {
    return !!lpGetCurrentUser()
}

/**
 * Handles the authentication actions
 * @param {*} action 
 * @param {*} data 
 * @returns 
 */

function lpAuth(action, data = {}) {
    if (action === "register") {
        const { email, password, name } = data
        if (!email || !password) return { ok: false, error: "Datos incompletos" }
        const users = lpReadUsers()
        const exists = users.some(u => u.email.toLowerCase() === String(email).toLowerCase())
        if (exists) return { ok: false, error: "El usuario ya existe" }
        const user = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), email, name: name || "", password }
        users.push(user)
        lpWriteUsers(users)
        lpSetCurrentUser({ id: user.id, email: user.email, name: user.name })
        return { ok: true, user: lpGetCurrentUser() }
    }
    if (action === "login") {
        const { email, password } = data
        if (!email || !password) return { ok: false, error: "Datos incompletos" }
        const users = lpReadUsers()
        const found = users.find(u => u.email.toLowerCase() === String(email).toLowerCase())
        if (!found) return { ok: false, error: "Usuario no encontrado" }
        if (found.password !== password) return { ok: false, error: "Credenciales inválidas" }
        lpSetCurrentUser({ id: found.id, email: found.email, name: found.name || "" })
        return { ok: true, user: lpGetCurrentUser() }
    }
    if (action === "logout") {
        lpSetCurrentUser(null)
        return { ok: true }
    }
    if (action === "status") {
        return { ok: true, authenticated: lpIsAuthenticated(), user: lpGetCurrentUser() }
    }
    return { ok: false, error: "Acción no soportada" }
}

/**
 * Exports the auth function
 */
window.auth = lpAuth
window.isAuthenticated = lpIsAuthenticated
window.getCurrentUser = lpGetCurrentUser

(function () {
    const btn = document.querySelector(".user-btn");
    const menu = document.getElementById("userMenu");
    if (!btn || !menu) return;
    function buildMenu() {
        const status = window.auth
            ? window.auth("status")
            : { authenticated: false };
        if (status.authenticated) {
            menu.innerHTML =
                '<a href="#" data-action="settings">Ajustes de usuario</a><a href="#" data-action="goapp">Ir a CultivApp</a>';
        } else {
            // Links to auth.html to handle authentication
            menu.innerHTML =
                '<a href="auth.html?action=login" data-action="login">Inicio de sesión</a><a href="auth.html?action=register" data-action="register">Registro</a>';
        }
    }
    function toggleMenu() {
        menu.classList.toggle("active");
    }
    function closeMenu(e) {
        if (!menu.contains(e.target) && !btn.contains(e.target))
            menu.classList.remove("active");
    }
    function handleClick(e) {
        const a = e.target.closest("a");
        if (!a) return;
        const action = a.getAttribute("data-action");
        // For login/registration, we let the link navigate to auth.html
        if (action === "login" || action === "register") {
            menu.classList.remove("active");
            return;
        }
        e.preventDefault();
        if (action === "settings") {
            alert("Open user settings");
        } else if (action === "goapp") {
            location.hash = "#features";
        }
        menu.classList.remove("active");
    }
    buildMenu();
    btn.addEventListener("click", toggleMenu);
    menu.addEventListener("click", handleClick);
    document.addEventListener("click", closeMenu);
})();


(function () {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    if (!loginForm || !registerForm) return;

    function getAction() {
        const params = new URLSearchParams(location.search);
        const action = params.get("action");
        return action === "register" || action === "login" ? action : "login";
    }
    function show(action) {
        document.getElementById("authTitle").textContent =
        action === "register" ? "Crear cuenta" : "Iniciar sesión";
        loginForm.style.display =
        action === "login" ? "grid" : "none";
        registerForm.style.display =
        action === "register" ? "grid" : "none";
        document.getElementById("authMessage").textContent = "";
    }

    function onLoginSubmit(e) {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const r = window.auth("login", { email, password });
        const msg = document.getElementById("authMessage");
        if (!r.ok) {
        msg.textContent = r.error || "Error al iniciar sesión";
        msg.dataset.type = "error";
        return;
        }
        msg.textContent = "¡Bienvenido! Redirigiendo...";
        msg.dataset.type = "success";
        setTimeout(() => {
        location.href = "index.html";
        }, 800);
    }

    function onRegisterSubmit(e) {
        e.preventDefault();
        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const r = window.auth("register", { name, email, password });
        const msg = document.getElementById("authMessage");
        if (!r.ok) {
        msg.textContent = r.error || "Error al registrar";
        msg.dataset.type = "error";
        return;
        }
        msg.textContent = "Cuenta creada. Redirigiendo...";
        msg.dataset.type = "success";
        setTimeout(() => {
        location.href = "index.html";
        }, 800);
    }

    loginForm.addEventListener("submit", onLoginSubmit);
    registerForm.addEventListener("submit", onRegisterSubmit);

    document
        .getElementById("goLogin")
        .addEventListener("click", function (e) {
        e.preventDefault();
        history.replaceState({}, "", "?action=login");
        show("login");
        });
    document
        .getElementById("goRegister")
        .addEventListener("click", function (e) {
        e.preventDefault();
        history.replaceState({}, "", "?action=register");
        show("register");
        });

    show(getAction());
})();