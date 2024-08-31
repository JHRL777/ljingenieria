// script.js

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const navItems = navLinks.querySelectorAll('a');

    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active'); // Alterna la visibilidad del menú
    });

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navLinks.classList.remove('active'); // Oculta el menú al hacer clic en un enlace
        });
    });
});

function changeMainImage(imageElement, portfolioItemId) {
    // Encuentra el elemento de la tarjeta usando el ID proporcionado
    var portfolioItem = document.getElementById(portfolioItemId);
    console.log(portfolioItem)
    if (portfolioItem) {
        // Encuentra la imagen principal dentro de la tarjeta
        var mainImage = portfolioItem.querySelector('.main-img');

        if (mainImage) {
            // Actualiza la imagen principal con la fuente de la imagen de la galería
            mainImage.src = imageElement.src;
        } else {
            console.error('No se encontró la imagen principal para la tarjeta con ID: ' + portfolioItemId);
        }
    } else {
        console.error('No se encontró el elemento de la tarjeta con ID: ' + portfolioItemId);
    }
}
