// Video and overlay management
let videoActive = true;

function closeVideo() {
    const promo = document.querySelector('.promo');
    const body = document.body;
    const header = document.querySelector('.header');
    
    // Removed minimized class to keep video size constant
    body.classList.remove('video-active');
    header.classList.remove('video-active');
    videoActive = false;
}

// Enhanced smooth transitions and animations
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const header = document.querySelector('.header');
    
    body.classList.add('video-active');
    header.classList.add('video-active');
    
    // Show overlay text after 1.5 seconds
    setTimeout(() => {
        const overlay = document.querySelector('.promo-overlay');
        if (overlay) {
            overlay.style.opacity = '1';
            overlay.style.transform = 'translateY(0)';
        }
        
        // Start animated text sequence
        startTextAnimation();
    }, 1500);

    // Initialize all animations
    initializeAnimations();
    
    // Smooth scroll for navigation
    initializeSmoothScroll();
    
    // Parallax effects
    initializeParallax();
    
    // Preload project videos to prevent black background
    preloadProjectVideos();
});

// Simple function to preload project videos
function preloadProjectVideos() {
    const projectVideos = document.querySelectorAll('.article-video-section video');
    projectVideos.forEach(video => {
        // Set background color to prevent black background
        video.style.background = '#000';
        
        // Simple preload without complex optimizations
        if (video.readyState === 0) {
            video.load();
        }
    });
}

// Initialize all animations with Intersection Observer
function initializeAnimations() {
    // Observer for sections (excluding video sections)
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animate child elements with delay (excluding video overlays)
                const animatedElements = entry.target.querySelectorAll('.fade-in-up, .research-card, .project-card, .value-item, .stat-item, .contact-item');
                animatedElements.forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add('visible');
                    }, index * 100);
                });
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // Observe all sections except video sections and article video section
    document.querySelectorAll('section:not(.promo):not(.article-video-section)').forEach(section => {
        sectionObserver.observe(section);
    });

    // Observer for individual elements (excluding article video elements)
    const elementObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.3 });

    // Observe text elements (excluding video overlay elements)
    document.querySelectorAll('.section-title:not(.article-video-title), .hero-title, .hero-subtitle, .hero-description').forEach(el => {
        elementObserver.observe(el);
    });
}

// Enhanced smooth scrolling
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Parallax effects
function initializeParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Close video when scrolling down
window.addEventListener('scroll', () => {
    // Close/minimize video when scrolling down
    if (videoActive && window.scrollY > 100) {
        closeVideo();
    }
});

// Close video function for scroll event
function closeVideo() {
    const body = document.body;
    const header = document.querySelector('.header');
    
    // Removed minimized class to keep video size constant
    body.classList.remove('video-active');
    header.classList.remove('video-active');
    videoActive = false;
}

// Enhanced mobile navigation (sidebar with overlay)
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
const navOverlay = document.getElementById('navOverlay');



function openMobileMenu() {
    navList.classList.add('active');
    navToggle.classList.add('active');
    if (navOverlay) navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    navList.classList.remove('active');
    navToggle.classList.remove('active');
    if (navOverlay) navOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (navList.classList.contains('active')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
});

if (navOverlay) {
    navOverlay.addEventListener('click', closeMobileMenu);
}

// Close when clicking a link
navList.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMobileMenu);
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navList.contains(e.target)) {
        closeMobileMenu();
    }
});

// Close mobile menu on window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
    

});

// Enhanced header scroll effect
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Close/minimize video when scrolling down
    if (videoActive && window.scrollY > 100) {
        closeVideo();
    }
});

// Enhanced project card effects
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', function() {
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
});

// Форма обрабатывается через EmailJS в HTML - убираем дублирующий код

// Функции валидации и уведомлений убраны - EmailJS обрабатывает форму

/* Функции для полных статей удалены - теперь используются только видео с описаниями */

// Enhanced page load animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    
    // Animate hero section on load
    setTimeout(() => {
        const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-description, .hero-buttons');
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, index * 200);
        });
    }, 500);
    
    // Улучшаем загрузку видео на мобильных устройствах
    improveMobileVideoLoading();
});

// Удалены функции мобильной «оптимизации» видео — используем нативное поведение браузера

// Функция анимации появления текста "Открой дверь в мир будущего"
function startTextAnimation() {
    const words = document.querySelectorAll('.promo-text-animated .word');
    words.forEach((word, index) => {
        setTimeout(() => {
            word.classList.add('visible');
        }, index * 500); // Задержка 0.5 секунды между словами
    });
}

// Функция для переключения разворачивающихся блоков проектов
function toggleProjectDetails(projectId) {
    const projectDetails = document.getElementById(projectId);
    const isExpanded = projectDetails.classList.contains('expanded');
    
    // Находим кнопку для этого проекта
    const button = document.querySelector(`button[onclick="toggleProjectDetails('${projectId}')"]`);
    
    // Закрываем все открытые блоки и сбрасываем текст кнопок
    const allProjectDetails = document.querySelectorAll('.project-details');
    allProjectDetails.forEach(project => {
        project.classList.remove('expanded');
    });
    
    // Сбрасываем текст всех кнопок на "Читать полностью"
    const allButtons = document.querySelectorAll('.read-more-btn');
    allButtons.forEach(btn => {
        btn.textContent = 'Читать полностью';
    });
    
    // Если блок был закрыт, открываем его и меняем текст кнопки
    if (!isExpanded) {
        projectDetails.classList.add('expanded');
        
        // Меняем текст кнопки на "Закрыть статью"
        if (button) {
            button.textContent = 'Закрыть статью';
        }
        
        // Плавно прокручиваем к открытому блоку
        setTimeout(() => {
            projectDetails.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 300);
    }
}




