// script.js

const PROJECTS_PER_PAGE = 6;
let allPortfolioProjects = [];
let currentPortfolioPage = 1;

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

async function renderPortfolio() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    let projects = window.portfolioProjects || [];

    if (!portfolioGrid) return;

    // Los proyectos locales se conservan mientras migras el portafolio existente.
    // Los nuevos se cargan desde Supabase y se muestran junto a ellos.
    if (window.supabaseClient) {
        const { data, error } = await window.supabaseClient
            .from('projects')
            .select('id,title,description,category,project_images(storage_path,alt_text,position)')
            .eq('published', true)
            .order('created_at', { ascending: false });
        if (!error && data) {
            const remoteProjects = data.map((project) => ({
                ...project,
                images: project.project_images
                    .sort((a, b) => a.position - b.position)
                    .map((image) => ({
                        src: window.supabaseClient.storage.from('project-images').getPublicUrl(image.storage_path).data.publicUrl,
                        alt: image.alt_text || project.title
                    }))
            }));
            projects = [...remoteProjects, ...projects.filter((local) => !remoteProjects.some((remote) => remote.id === local.id))];
        }
    }

    allPortfolioProjects = projects;
    currentPortfolioPage = 1;
    setupPortfolioPagination();
    renderPortfolioPage();
}

function setupPortfolioPagination() {
    const previous = document.getElementById('portfolio-previous');
    const next = document.getElementById('portfolio-next');
    if (!previous || !next || previous.dataset.ready) return;

    previous.dataset.ready = 'true';
    previous.addEventListener('click', () => changePortfolioPage(-1));
    next.addEventListener('click', () => changePortfolioPage(1));
}

function changePortfolioPage(direction) {
    const totalPages = Math.ceil(allPortfolioProjects.length / PROJECTS_PER_PAGE);
    const newPage = currentPortfolioPage + direction;
    if (newPage < 1 || newPage > totalPages) return;
    currentPortfolioPage = newPage;
    renderPortfolioPage();
    document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderPortfolioPage() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    const pagination = document.getElementById('portfolio-pagination');
    const previous = document.getElementById('portfolio-previous');
    const next = document.getElementById('portfolio-next');
    const status = document.getElementById('portfolio-page-status');
    if (!portfolioGrid) return;

    const totalPages = Math.ceil(allPortfolioProjects.length / PROJECTS_PER_PAGE);
    const firstProject = (currentPortfolioPage - 1) * PROJECTS_PER_PAGE;
    const pageProjects = allPortfolioProjects.slice(firstProject, firstProject + PROJECTS_PER_PAGE);
    portfolioGrid.innerHTML = '';

    pageProjects.forEach((project) => {
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

    if (pagination && previous && next && status) {
        pagination.hidden = totalPages <= 1;
        previous.disabled = currentPortfolioPage === 1;
        next.disabled = currentPortfolioPage === totalPages;
        status.textContent = `Página ${currentPortfolioPage} de ${totalPages}`;
    }
}

function changeMainImage(imageElement, portfolioItemId) {
    const portfolioItem = document.getElementById(portfolioItemId);
    const mainImage = portfolioItem?.querySelector('.main-img');

    if (mainImage) {
        mainImage.src = imageElement.src;
        mainImage.alt = imageElement.alt;
    }
}
