// script.js

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const navItems = navLinks.querySelectorAll('a');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            const isOpen = navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    renderPortfolio();
});

function renderPortfolio() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    const projects = window.portfolioProjects || [];

    if (!portfolioGrid) return;

    portfolioGrid.innerHTML = '';

    projects.forEach((project, index) => {
        const card = document.createElement('article');
        card.className = 'portfolio-item';
        card.id = project.id;
        card.dataset.category = project.category;

        const firstImage = project.images[0] || { src: '', alt: '' };
        const galleryImages = project.images.slice(1);

        card.innerHTML = `
            <div class="main-image">
                <img class="main-img" src="${firstImage.src}" alt="${firstImage.alt}" width="400" height="300" loading="lazy">
            </div>
            <div class="gallery">
                ${galleryImages.map((image, imageIndex) => `
                    <div class="gallery-item">
                        <img src="${image.src}" alt="${image.alt}" width="100" height="100" loading="lazy" data-project-id="${project.id}" data-image-src="${image.src}" data-image-alt="${image.alt}">
                    </div>
                `).join('')}
            </div>
            <div class="project-description">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
            </div>
        `;

        portfolioGrid.appendChild(card);
    });

    portfolioGrid.querySelectorAll('.gallery-item img').forEach((thumbnail) => {
        thumbnail.addEventListener('click', function() {
            const projectCard = document.getElementById(this.dataset.projectId);
            const mainImage = projectCard?.querySelector('.main-img');

            if (mainImage) {
                mainImage.src = this.dataset.imageSrc;
                mainImage.alt = this.dataset.imageAlt;
            }
        });
    });
}

function changeMainImage(imageElement, portfolioItemId) {
    const portfolioItem = document.getElementById(portfolioItemId);
    const mainImage = portfolioItem?.querySelector('.main-img');

    if (mainImage) {
        mainImage.src = imageElement.src;
        mainImage.alt = imageElement.alt;
    }
}
