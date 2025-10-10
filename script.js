
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
        const user = { 
            id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), 
            email, 
            name: name || "", 
            password 
        }
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

/**
 * User menu functionality (for index.html)
 */
function initUserMenu() {
    const btn = document.querySelector(".user-btn");
    const menu = document.getElementById("userMenu");
    
    if (!btn || !menu) return;
    
    // Build menu based on authentication status
    function buildMenu() {
        const isAuth = lpIsAuthenticated();
        const user = lpGetCurrentUser();
        
        if (isAuth && user) {
            menu.innerHTML = `
                <div class="user-info">${user.name || user.email}</div>
                <a href="#" data-action="logout">Cerrar sesión</a>
                <a href="https://frontend-frutech-static.onrender.com" data-action="goapp">Ir a CultivApp</a>
            `;
        } else {
            menu.innerHTML = `
                <a href="auth.html?action=login">Inicio de sesión</a>
                <a href="auth.html?action=register">Registro</a>
            `;
        }
    }
    
    // Toggle menu visibility
    function toggleMenu(e) {
        e.stopPropagation();
        menu.classList.toggle("active");
    }
    
    // Close menu when clicking outside
    function closeMenu(e) {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
            menu.classList.remove("active");
        }
    }
    
    // Handle menu item clicks
    function handleMenuClick(e) {
        const link = e.target.closest("a");
        if (!link) return;
        
        const action = link.getAttribute("data-action");
        
        // If it's a regular link (login/register), let it navigate
        if (!action) {
            menu.classList.remove("active");
            return;
        }
        
        // Handle specific actions
        e.preventDefault();
        
        if (action === "logout") {
            lpAuth("logout");
            buildMenu(); // Rebuild menu after logout
            alert("Sesión cerrada correctamente");
        } else if (action === "goapp") {
            window.open("https://frontend-frutech-static.onrender.com", "_blank");
        }
        menu.classList.remove("active");
    }
    
    // Initialize
    buildMenu();
    btn.addEventListener("click", toggleMenu);
    menu.addEventListener("click", handleMenuClick);
    document.addEventListener("click", closeMenu);
}

/**
 * Auth forms functionality (for auth.html)
 */
function initAuthForms() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    
    if (!loginForm || !registerForm) return;
    
    // Get action from URL
    function getAction() {
        const params = new URLSearchParams(window.location.search);
        const action = params.get("action");
        return action === "register" ? "register" : "login";
    }
    
    // Show the correct form
    function showForm(action) {
        const authTitle = document.getElementById("authTitle");
        const authMessage = document.getElementById("authMessage");
        
        if (authTitle) {
            authTitle.textContent = action === "register" ? "Crear cuenta" : "Iniciar sesión";
        }
        
        loginForm.style.display = action === "login" ? "grid" : "none";
        registerForm.style.display = action === "register" ? "grid" : "none";
        
        if (authMessage) {
            authMessage.textContent = "";
        }
    }
    
    // Handle login form submission
    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const result = lpAuth("login", { email, password });
        const msg = document.getElementById("authMessage");
        
        if (!result.ok) {
            msg.textContent = result.error || "Error al iniciar sesión";
            msg.style.color = "red";
            return;
        }
        
        msg.textContent = "¡Bienvenido! Redirigiendo...";
        msg.style.color = "green";
        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);
    }
    
    // Handle register form submission
    function handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const result = lpAuth("register", { name, email, password });
        const msg = document.getElementById("authMessage");
        
        if (!result.ok) {
            msg.textContent = result.error || "Error al registrar";
            msg.style.color = "red";
            return;
        }
        
        msg.textContent = "Cuenta creada. Redirigiendo...";
        msg.style.color = "green";
        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);
    }
    
    // Switch between login and register
    const goLogin = document.getElementById("goLogin");
    const goRegister = document.getElementById("goRegister");
    
    if (goLogin) {
        goLogin.addEventListener("click", function(e) {
            e.preventDefault();
            history.replaceState({}, "", "?action=login");
            showForm("login");
        });
    }
    
    if (goRegister) {
        goRegister.addEventListener("click", function(e) {
            e.preventDefault();
            history.replaceState({}, "", "?action=register");
            showForm("register");
        });
    }
    
    // Attach event listeners
    loginForm.addEventListener("submit", handleLogin);
    registerForm.addEventListener("submit", handleRegister);
    
    // Initialize with correct form
    showForm(getAction());
}

/**
 * Initialize the appropriate functionality based on the page
 */
document.addEventListener("DOMContentLoaded", function() {
    // Initialize user menu on index.html
    initUserMenu();
    
    // Initialize auth forms on auth.html
    initAuthForms();
});