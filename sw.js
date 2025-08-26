// Service Worker для кэширования видео и оптимизации загрузки
const CACHE_NAME = 'aires-video-cache-v1';
const VIDEO_CACHE_NAME = 'aires-video-cache-v1';

// Ресурсы для кэширования
const STATIC_RESOURCES = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/video-optimizer.js',
    '/logo.png',
    '/logohead.png',
    '/favicon.png'
];

// Событие установки Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Установка...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Кэширование статических ресурсов');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => {
                console.log('Service Worker: Установка завершена');
                return self.skipWaiting();
            })
    );
});

// Событие активации Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Активация...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME && cacheName !== VIDEO_CACHE_NAME) {
                            console.log('Service Worker: Удаление старого кэша:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Активация завершена');
                return self.clients.claim();
            })
    );
});

// Событие перехвата запросов
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Обрабатываем только GET запросы
    if (request.method !== 'GET') return;
    
    // Проверяем, является ли запрос видео
    if (isVideoRequest(request)) {
        event.respondWith(handleVideoRequest(request));
        return;
    }
    
    // Обрабатываем статические ресурсы
    if (isStaticResource(request)) {
        event.respondWith(handleStaticResource(request));
        return;
    }
    
    // Для остальных запросов используем сеть
    event.respondWith(fetch(request));
});

// Проверка, является ли запрос видео
function isVideoRequest(request) {
    const url = new URL(request.url);
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    return videoExtensions.some(ext => url.pathname.includes(ext));
}

// Проверка, является ли запрос статическим ресурсом
function isStaticResource(request) {
    const url = new URL(request.url);
    return STATIC_RESOURCES.some(resource => url.pathname.includes(resource));
}

// Обработка запросов видео
async function handleVideoRequest(request) {
    const cache = await caches.open(VIDEO_CACHE_NAME);
    
    try {
        // Сначала проверяем кэш
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            console.log('Service Worker: Видео загружено из кэша:', request.url);
            return cachedResponse;
        }
        
        // Если в кэше нет, загружаем из сети
        const networkResponse = await fetch(request);
        
        // Кэшируем видео только если загрузка успешна
        if (networkResponse.ok) {
            // Клонируем ответ, так как он может быть использован только один раз
            const responseToCache = networkResponse.clone();
            cache.put(request, responseToCache);
            console.log('Service Worker: Видео загружено из сети и закэшировано:', request.url);
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('Service Worker: Ошибка загрузки видео:', error);
        
        // Возвращаем fallback или ошибку
        return new Response('Ошибка загрузки видео', {
            status: 500,
            statusText: 'Internal Server Error'
        });
    }
}

// Обработка статических ресурсов
async function handleStaticResource(request) {
    const cache = await caches.open(CACHE_NAME);
    
    try {
        // Сначала проверяем кэш
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Если в кэше нет, загружаем из сети
        const networkResponse = await fetch(request);
        
        // Кэшируем только если загрузка успешна
        if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            cache.put(request, responseToCache);
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('Service Worker: Ошибка загрузки статического ресурса:', error);
        return new Response('Ошибка загрузки ресурса', {
            status: 500,
            statusText: 'Internal Server Error'
        });
    }
}

// Обработка сообщений от основного потока
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CLEAR_CACHE':
            clearCache();
            break;
            
        case 'GET_CACHE_INFO':
            getCacheInfo(event);
            break;
            
        default:
            console.log('Service Worker: Неизвестный тип сообщения:', type);
    }
});

// Очистка кэша
async function clearCache() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('Service Worker: Кэш очищен');
    } catch (error) {
        console.log('Service Worker: Ошибка очистки кэша:', error);
    }
}

// Получение информации о кэше
async function getCacheInfo(event) {
    try {
        const cacheNames = await caches.keys();
        const cacheInfo = {};
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            cacheInfo[cacheName] = keys.length;
        }
        
        event.ports[0].postMessage({
            type: 'CACHE_INFO',
            data: cacheInfo
        });
    } catch (error) {
        console.log('Service Worker: Ошибка получения информации о кэше:', error);
    }
}

// Обработка ошибок
self.addEventListener('error', (event) => {
    console.error('Service Worker: Ошибка:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Необработанное отклонение промиса:', event.reason);
});
