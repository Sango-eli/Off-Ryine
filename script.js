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
    if (files.length === 0) return;

    Array.from(files).forEach(file => {
        // Convert file to base64 and save
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileData = {
                name: file.name,
                type: file.type,
                data: e.target.result
            };
            
            saveMediaToStorage(containerId, fileData);
            showToast(`${file.name} saved successfully!`);
        };
        reader.readAsDataURL(file);
    });
    
    // Reset file input
    document.getElementById(getInputIdByContainer(type)).value = '';
}

function getInputIdByContainer(type) {
    const map = { 'audio': 'audio-upload', 'video': 'video-upload', 'image': 'image-upload' };
    return map[type];
}

function saveMediaToStorage(containerId, fileData) {
    let savedMedia = JSON.parse(localStorage.getItem(containerId) || '[]');
    savedMedia.push(fileData);
    localStorage.setItem(containerId, JSON.stringify(savedMedia));
    
    // Refresh display
    loadMediaFromStorage(containerId);
}

function loadMediaFromStorage(containerId) {
    const container = document.getElementById(containerId);
    const savedMedia = JSON.parse(localStorage.getItem(containerId) || '[]');
    
    // For video-list, keep the default video and add uploaded ones
    if (containerId === 'video-list') {
        // Remove only dynamically added items, keep the default video
        const defaultVideo = container.querySelector('.media-item');
        container.innerHTML = '';
        if (defaultVideo) {
            container.appendChild(defaultVideo);
        }
    } else {
        container.innerHTML = '';
    }
    
    savedMedia.forEach((fileData, index) => {
        const element = createMediaElementFromData(fileData, containerId, index);
        if (element) {
            container.appendChild(element);
        }
    });
}

function createMediaElementFromData(fileData, containerId, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'media-item';
    wrapper.style.position = 'relative';

    const type = fileData.type.split('/')[0];

    if (type === 'audio') {
        // Handle both file paths and base64 data
        const audioSource = fileData.filePath || fileData.data;
        const backgroundImage = fileData.backgroundImage ? `url('${fileData.backgroundImage}')` : 'none';
        
        const audioWrapper = document.createElement('div');
        audioWrapper.style.backgroundImage = backgroundImage;
        audioWrapper.style.backgroundSize = 'cover';
        audioWrapper.style.backgroundPosition = 'center';
        audioWrapper.style.padding = backgroundImage !== 'none' ? '20px' : '10px';
        audioWrapper.style.borderRadius = backgroundImage !== 'none' ? '8px' : '0';
        audioWrapper.style.minWidth = '100%';
        audioWrapper.style.display = 'flex';
        audioWrapper.style.alignItems = 'center';

        const audio = document.createElement('audio');
        audio.controls = true;
        audio.controlsList = 'nodownload';
        audio.style.width = '100%';
        audio.style.minHeight = '40px';
        
        // Create source element for better compatibility
        const source = document.createElement('source');
        source.src = audioSource;
        source.type = 'audio/mpeg';
        audio.appendChild(source);
        
        // Fallback text
        audio.textContent = 'Your browser does not support the audio element.';
        
        audioWrapper.appendChild(audio);
        wrapper.appendChild(audioWrapper);
    } else if (type === 'video') {
        const videoSource = fileData.filePath || fileData.data;
        const videoId = 'video-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const videoContainer = document.createElement('div');
        videoContainer.style.position = 'relative';
        
        const video = document.createElement('video');
        video.id = videoId;
        video.controls = true;
        video.playsinline = true;
        video.preload = 'metadata';
        video.style.width = '100%';
        video.style.height = '200px';
        video.style.objectFit = 'cover';
        video.style.borderRadius = '8px';

        // Set src directly for local files
        video.src = videoSource;

        // Fallback text
        video.textContent = 'Your browser does not support the video element.';
        
        videoContainer.appendChild(video);
        
        // Add custom play/pause button
        const customControls = document.createElement('div');
        customControls.className = 'custom-controls';
        customControls.style.position = 'absolute';
        customControls.style.bottom = '10px';
        customControls.style.left = '10px';
        customControls.style.display = 'flex';
        customControls.style.gap = '10px';
        
        const playPauseBtn = document.createElement('button');
        playPauseBtn.className = 'play-pause-btn';
        playPauseBtn.onclick = () => togglePlayPause(videoId);
        playPauseBtn.style.background = 'rgba(255, 0, 110, 0.9)';
        playPauseBtn.style.border = 'none';
        playPauseBtn.style.borderRadius = '50%';
        playPauseBtn.style.width = '50px';
        playPauseBtn.style.height = '50px';
        playPauseBtn.style.color = 'white';
        playPauseBtn.style.fontSize = '18px';
        playPauseBtn.style.cursor = 'pointer';
        playPauseBtn.style.display = 'flex';
        playPauseBtn.style.alignItems = 'center';
        playPauseBtn.style.justifyContent = 'center';
        playPauseBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        
        const playIcon = document.createElement('i');
        playIcon.className = 'fas fa-play';
        playIcon.id = videoId + '-play-icon';
        playPauseBtn.appendChild(playIcon);
        
        customControls.appendChild(playPauseBtn);
        videoContainer.appendChild(customControls);
        
        wrapper.appendChild(videoContainer);
    } else if (type === 'image') {
        const imgSource = fileData.filePath || fileData.data;
        const img = document.createElement('img');
        img.src = imgSource;
        img.style.width = '100%';
        img.style.height = '200px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        img.onclick = () => openLightbox(img.src);
        wrapper.appendChild(img);
    }

    const fileName = document.createElement('p');
    fileName.textContent = fileData.name;
    fileName.style.fontSize = '0.8rem';
    fileName.style.textAlign = 'center';
    fileName.style.marginTop = '0.5rem';
    wrapper.appendChild(fileName);

    // Add delete button only for owner
    const isOwner = localStorage.getItem('isOwner') === 'true';
    if (isOwner) {
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.className = 'delete-media-btn';
        deleteBtn.title = 'Delete this media';
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '5px';
        deleteBtn.style.right = '5px';
        deleteBtn.style.backgroundColor = 'rgba(255, 0, 110, 0.8)';
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = '50%';
        deleteBtn.style.width = '30px';
        deleteBtn.style.height = '30px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.color = 'white';
        deleteBtn.style.fontSize = '1rem';
        deleteBtn.style.display = 'flex';
        deleteBtn.style.alignItems = 'center';
        deleteBtn.style.justifyContent = 'center';
        deleteBtn.style.transition = 'background-color 0.3s ease';
        
        deleteBtn.onmouseover = () => deleteBtn.style.backgroundColor = 'rgba(255, 0, 110, 1)';
        deleteBtn.onmouseout = () => deleteBtn.style.backgroundColor = 'rgba(255, 0, 110, 0.8)';
        
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteMediaFromStorage(containerId, index);
            showToast(`${fileData.name} deleted`);
        };
        
        wrapper.appendChild(deleteBtn);
    }

    return wrapper;
}

function deleteMediaFromStorage(containerId, index) {
    let savedMedia = JSON.parse(localStorage.getItem(containerId) || '[]');
    savedMedia.splice(index, 1);
    localStorage.setItem(containerId, JSON.stringify(savedMedia));
    
    // Refresh display
    loadMediaFromStorage(containerId);
}

function createMediaElement(file, type) {
    const wrapper = document.createElement('div');
    wrapper.className = 'media-item';
    wrapper.style.position = 'relative';

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

    // Add delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.className = 'delete-media-btn';
    deleteBtn.title = 'Delete this media';
    deleteBtn.style.position = 'absolute';
    deleteBtn.style.top = '5px';
    deleteBtn.style.right = '5px';
    deleteBtn.style.backgroundColor = 'rgba(255, 0, 110, 0.8)';
    deleteBtn.style.border = 'none';
    deleteBtn.style.borderRadius = '50%';
    deleteBtn.style.width = '30px';
    deleteBtn.style.height = '30px';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.color = 'white';
    deleteBtn.style.fontSize = '1rem';
    deleteBtn.style.display = 'flex';
    deleteBtn.style.alignItems = 'center';
    deleteBtn.style.justifyContent = 'center';
    deleteBtn.style.transition = 'background-color 0.3s ease';
    
    deleteBtn.onmouseover = () => deleteBtn.style.backgroundColor = 'rgba(255, 0, 110, 1)';
    deleteBtn.onmouseout = () => deleteBtn.style.backgroundColor = 'rgba(255, 0, 110, 0.8)';
    
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        wrapper.remove();
        showToast(`${file.name} removed`);
    };
    
    wrapper.appendChild(deleteBtn);

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

    // Hide/show upload input sections
    const uploadSections = document.querySelectorAll('.owner-upload-section');
    uploadSections.forEach(section => {
        section.style.display = enabled ? 'block' : 'none';
    });

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

    // Show/hide owner-only delete buttons
    const ownerOnlyButtons = document.querySelectorAll('.owner-only');
    ownerOnlyButtons.forEach(button => {
        button.style.display = enabled ? 'flex' : 'none';
    });

    // Refresh media displays to show/hide delete buttons
    loadMediaFromStorage('image-gallery');
    loadMediaFromStorage('audio-list');
    loadMediaFromStorage('video-list');
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

// Add event listener for default video delete button
const defaultVideoDeleteBtn = document.querySelector('#video-list .owner-only');
if (defaultVideoDeleteBtn) {
    defaultVideoDeleteBtn.addEventListener('click', () => {
        const defaultVideoItem = document.querySelector('#video-list .media-item');
        if (defaultVideoItem) {
            defaultVideoItem.remove();
            showToast('Kigwerawa video removed');
        }
    });
}

// Custom play/pause functionality
function togglePlayPause(videoId) {
    const video = document.getElementById(videoId);
    const playIcon = document.getElementById(videoId + '-play-icon');
    
    if (video.paused) {
        video.play();
        playIcon.className = 'fas fa-pause';
    } else {
        video.pause();
        playIcon.className = 'fas fa-play';
    }
}

// Update play/pause icons when video state changes
document.addEventListener('DOMContentLoaded', function() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        const videoId = video.id;
        const playIcon = document.getElementById(videoId + '-play-icon');
        
        if (playIcon) {
            video.addEventListener('play', () => {
                playIcon.className = 'fas fa-pause';
            });
            
            video.addEventListener('pause', () => {
                playIcon.className = 'fas fa-play';
            });
            
            video.addEventListener('ended', () => {
                playIcon.className = 'fas fa-play';
            });
        }
    });
});

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

// Initialize and load saved media on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize default audio file
    const savedAudio = JSON.parse(localStorage.getItem('audio-list') || '[]');
    
    // Check if we need to add or update the default audio
    const defaultAudioExists = savedAudio.some(audio => audio.name === 'Joannah--K Universe--Offryine');
    
    if (!defaultAudioExists) {
        // Add default audio file
        const defaultAudio = {
            name: 'Joannah--K Universe--Offryine',
            type: 'audio/mpeg',
            filePath: 'Joannah--K Universe--Offryine .mp3',
            backgroundImage: 'IMG_4392.PNG'
        };
        savedAudio.push(defaultAudio);
        localStorage.setItem('audio-list', JSON.stringify(savedAudio));
    } else {
        // Update existing default audio with correct background
        const updatedAudio = savedAudio.map(audio => {
            if (audio.name === 'Joannah--K Universe--Offryine') {
                return {
                    ...audio,
                    backgroundImage: 'IMG_4392.PNG'
                };
            }
            return audio;
        });
        localStorage.setItem('audio-list', JSON.stringify(updatedAudio));
    }

    loadMediaFromStorage('image-gallery');
    
    // Initialize default image file
    const savedImages = JSON.parse(localStorage.getItem('image-gallery') || '[]');
    if (savedImages.length === 0) {
        // Add default image file
        const defaultImage = {
            name: 'IMG_4392.PNG',
            type: 'image/png',
            filePath: 'IMG_4392.PNG',
            data: 'IMG_4392.PNG'
        };
        savedImages.push(defaultImage);
        localStorage.setItem('image-gallery', JSON.stringify(savedImages));
    }
    
    loadMediaFromStorage('audio-list');
    
    // Initialize default video file (only add uploaded videos to localStorage)
    const savedVideo = JSON.parse(localStorage.getItem('video-list') || '[]');
    // Don't add default video to localStorage since it's embedded in HTML
    
    loadMediaFromStorage('video-list');

    // Attempt autoplay for first audio in portfolio
    setTimeout(() => {
        const firstAudio = document.querySelector('#audio-list audio');
        if (firstAudio) {
            firstAudio.play().catch(() => {
                showToast('Autoplay blocked by browser. Please press play to start audio.', 'info');
            });
        }
    }, 500);
});
