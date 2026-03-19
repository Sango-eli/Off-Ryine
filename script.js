// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Update active nav link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu a');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - sectionHeight / 3) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Lightbox functionality
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.close');

function openLightbox(src) {
    lightbox.style.display = 'flex';
    lightboxImg.src = src;
    document.body.style.overflow = 'hidden';
}

closeBtn.onclick = function() {
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

lightbox.onclick = function(event) {
    if (event.target === lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Handle audio uploads
document.getElementById('audio-upload').addEventListener('change', function(event) {
    handleFileUpload(event.target.files, 'audio-list', 'audio');
});

// Handle video uploads
document.getElementById('video-upload').addEventListener('change', function(event) {
    handleFileUpload(event.target.files, 'video-list', 'video');
});

// Handle image uploads
document.getElementById('image-upload').addEventListener('change', function(event) {
    handleFileUpload(event.target.files, 'image-gallery', 'image');
});

function handleFileUpload(files, containerId, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (files.length === 0) return;

    Array.from(files).forEach(file => {
        const element = createMediaElement(file, type);
        if (element) {
            container.appendChild(element);
        }
    });
}

function createMediaElement(file, type) {
    const wrapper = document.createElement('div');
    wrapper.className = 'media-item';

    if (type === 'audio') {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = URL.createObjectURL(file);
        wrapper.appendChild(audio);
    } else if (type === 'video') {
        const video = document.createElement('video');
        video.controls = true;
        video.src = URL.createObjectURL(file);
        video.style.width = '100%';
        video.style.height = '200px';
        video.style.objectFit = 'cover';
        wrapper.appendChild(video);
    } else if (type === 'image') {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onclick = () => openLightbox(img.src);
        wrapper.appendChild(img);
    }

    const fileName = document.createElement('p');
    fileName.textContent = file.name;
    fileName.style.fontSize = '0.8rem';
    fileName.style.textAlign = 'center';
    fileName.style.marginTop = '0.5rem';
    wrapper.appendChild(fileName);

    return wrapper;
}

// Add fade-in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.portfolio-item, #about .container, .composition-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Play button functionality for compositions
document.querySelectorAll('.play-button').forEach(button => {
    button.addEventListener('click', function() {
        const card = this.closest('.composition-card');
        const songTitle = card.querySelector('h3').textContent;
        const artist = card.querySelector('.artist').textContent;

        // Animate the button
        this.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);

        // Show toast notification
        showToast(`"${songTitle}" ${artist} - Audio preview not available. Check streaming platforms!`, 'info');
    });
});

// Toast notification function
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'info' ? 'var(--accent-color)' : 'var(--text-color)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: '10000',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease',
        fontSize: '0.9rem',
        maxWidth: '300px'
    });

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Navigation toggle (mobile)
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
    }
});

// Owner mode (uploads only enabled for owner)
const OWNER_PASSWORD = 'musician123'; // Change this to your preferred owner password
const ownerBtn = document.getElementById('owner-btn');
const ownerLoginInline = document.getElementById('owner-login-inline');
const ownerModal = document.getElementById('owner-modal');
const ownerClose = ownerModal.querySelector('.modal-close');
const ownerSubmit = document.getElementById('owner-submit');
const ownerPasswordInput = document.getElementById('owner-password');
const ownerError = document.getElementById('owner-error');
const fileInputs = document.querySelectorAll('.owner-only-input');
const ownerWarning = document.querySelector('.owner-warning');

function setOwnerMode(enabled) {
    localStorage.setItem('isOwner', enabled ? 'true' : 'false');

    fileInputs.forEach(input => {
        input.disabled = !enabled;
        input.title = enabled ? 'Upload your media' : 'Owner only - Login to upload';
        if (enabled) {
            input.classList.add('visible');
        } else {
            input.classList.remove('visible');
        }
    });

    if (ownerWarning) {
        ownerWarning.style.display = enabled ? 'none' : 'block';
    }
}

function openOwnerModal() {
    ownerModal.classList.add('active');
    ownerModal.setAttribute('aria-hidden', 'false');
    ownerPasswordInput.value = '';
    ownerError.textContent = '';
    ownerPasswordInput.focus();
}

function closeOwnerModal() {
    ownerModal.classList.remove('active');
    ownerModal.setAttribute('aria-hidden', 'true');
}

function validateOwner() {
    const value = ownerPasswordInput.value.trim();
    if (value === OWNER_PASSWORD) {
        setOwnerMode(true);
        closeOwnerModal();
        showToast('✅ Owner mode enabled. Upload controls are now active.', 'info');
    } else {
        ownerError.textContent = '❌ Password incorrect. Try again.';
        ownerPasswordInput.focus();
    }
}

ownerBtn.addEventListener('click', openOwnerModal);
if (ownerLoginInline) ownerLoginInline.addEventListener('click', openOwnerModal);
ownerClose.addEventListener('click', closeOwnerModal);
ownerModal.addEventListener('click', (event) => {
    if (event.target === ownerModal) {
        closeOwnerModal();
    }
});

ownerSubmit.addEventListener('click', validateOwner);
ownerPasswordInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        validateOwner();
    }
});

// Initialize
const isOwner = localStorage.getItem('isOwner') === 'true';
setOwnerMode(isOwner);

// Set first nav link as active
const firstLink = document.querySelector('.nav-menu a');
if (firstLink) {
    firstLink.classList.add('active');
}

// Footer helpers (dynamic year + scroll-to-top)
const scrollTopBtn = document.getElementById('scroll-top');
const footerYear = document.getElementById('footer-year');

function updateFooterYear() {
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }
}

function setScrollVisibility() {
    if (!scrollTopBtn) return;
    if (window.scrollY > 300) {
        scrollTopBtn.classList.remove('hidden');
    } else {
        scrollTopBtn.classList.add('hidden');
    }
}

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', setScrollVisibility);
    setScrollVisibility();
}

updateFooterYear();
