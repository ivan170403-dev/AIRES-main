// Video Optimizer - Оптимизация загрузки видео для мобильных устройств
class VideoOptimizer {
    constructor() {
        this.videos = [];
        this.intersectionObserver = null;
        this.isMobile = this.detectMobile();
        this.networkSpeed = 'fast'; // fast, medium, slow
        this.init();
    }

    init() {
        this.detectNetworkSpeed();
        this.setupIntersectionObserver();
        this.setupServiceWorker();
        this.optimizeExistingVideos();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    detectNetworkSpeed() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                this.networkSpeed = 'slow';
            } else if (connection.effectiveType === '3g') {
                this.networkSpeed = 'medium';
            } else {
                this.networkSpeed = 'fast';
            }
        }
    }

    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadVideo(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker зарегистрирован:', registration);
                })
                .catch(error => {
                    console.log('Ошибка регистрации Service Worker:', error);
                });
        }
    }

    optimizeExistingVideos() {
        const videoElements = document.querySelectorAll('.lazy-video');
        videoElements.forEach(video => {
            this.videos.push(video);
            this.intersectionObserver.observe(video);
            
            // Добавляем постер-изображение для мобильных
            if (this.isMobile) {
                this.addVideoPoster(video);
            }
        });
    }

    addVideoPoster(video) {
        const container = video.closest('.video-container');
        if (container) {
            const poster = document.createElement('div');
            poster.className = 'video-poster';
            poster.innerHTML = `
                <div class="poster-content">
                    <i class="fas fa-play-circle"></i>
                    <p>Нажмите для воспроизведения</p>
                </div>
            `;
            container.appendChild(poster);
            
            // Показываем постер пока видео не загружено
            poster.style.display = 'block';
            video.style.opacity = '0';
            
            // Скрываем постер после загрузки видео
            video.addEventListener('loadeddata', () => {
                poster.style.display = 'none';
                video.style.opacity = '1';
            });
        }
    }

    loadVideo(video) {
        if (video.dataset.loaded === 'true') return;
        
        const dataSrc = video.dataset.src;
        if (!dataSrc) return;

        // Определяем качество видео в зависимости от сети и устройства
        let videoQuality = this.getOptimalVideoQuality();
        
        // Обновляем источники видео
        this.updateVideoSources(video, videoQuality);
        
        // Загружаем видео
        video.load();
        video.dataset.loaded = 'true';
        
        // Начинаем воспроизведение только если видео видимо
        if (this.isVideoVisible(video)) {
            video.play().catch(e => {
                console.log('Автовоспроизведение заблокировано:', e);
                this.showPlayButton(video);
            });
        } else {
            this.showPlayButton(video);
        }
    }

    getOptimalVideoQuality() {
        if (this.isMobile) {
            if (this.networkSpeed === 'slow') {
                return 'low';
            } else if (this.networkSpeed === 'medium') {
                return 'low';
            } else {
                return 'standard';
            }
        } else {
            if (this.networkSpeed === 'slow') {
                return 'low';
            } else {
                return 'standard'; // На ПК используем MP4 в хорошем качестве
            }
        }
    }

    updateVideoSources(video, quality) {
        const sources = video.querySelectorAll('source');
        sources.forEach(source => {
            if (quality === 'webm' && source.type === 'video/webm') {
                source.src = source.dataset.srcWebm || source.src;
            } else if (quality === 'low' && source.dataset.srcLow) {
                source.src = source.dataset.srcLow;
            } else if (quality === 'standard') {
                // Для стандартного качества используем первый источник (MP4 в хорошем качестве)
                if (source.type === 'video/mp4' && !source.dataset.srcLow) {
                    // Оставляем текущий источник (MP4/pomidor.mp4)
                }
            }
        });
    }

    isVideoVisible(video) {
        const rect = video.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    showPlayButton(video) {
        const container = video.closest('.video-container');
        if (container) {
            const playButton = container.querySelector('.video-play-button');
            if (playButton) {
                playButton.style.display = 'flex';
                playButton.addEventListener('click', () => {
                    video.play();
                    playButton.style.display = 'none';
                });
            }
        }
    }

    // Метод для принудительной загрузки всех видео (для тестирования)
    loadAllVideos() {
        this.videos.forEach(video => {
            this.loadVideo(video);
        });
    }

    // Метод для очистки памяти
    cleanup() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        this.videos = [];
    }
}

// Инициализация оптимизатора видео
document.addEventListener('DOMContentLoaded', () => {
    window.videoOptimizer = new VideoOptimizer();
});

// Обработка изменения сетевого соединения
if ('connection' in navigator) {
    navigator.connection.addEventListener('change', () => {
        if (window.videoOptimizer) {
            window.videoOptimizer.detectNetworkSpeed();
        }
    });
}

// Обработка видимости страницы для оптимизации воспроизведения
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Останавливаем все видео при скрытии страницы
        document.querySelectorAll('.lazy-video').forEach(video => {
            if (!video.paused) {
                video.pause();
            }
        });
    }
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoOptimizer;
}
