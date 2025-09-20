
/**
 * Creacion de boton hamburguesa
 */

const btn = document.querySelector(".menu-toggle");
const menu = document.querySelector("nav-menu");

//EventListener para click
btn.addEventListener("click", () => {
    //Al dar click en el icono de menu hamburguesa, se alterna
    menu.classList.toggle("active");
})

//Se cierra el menu horizontal al hacer otro click
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        menu.classList.remove("active");
    })
})