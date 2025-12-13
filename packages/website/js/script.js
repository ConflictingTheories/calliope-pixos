/**
 * PixoSpritz Website JavaScript
 * Handles navigation, smooth scrolling, game loading, and animations
 */

// ============================================
// Navigation & Mobile Menu
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Active nav link based on scroll position
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink?.classList.add('active');
            } else {
                navLink?.classList.remove('active');
            }
        });
    });
});

// ============================================
// Smooth Scrolling
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Skip if it's just "#"
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const offsetTop = target.offsetTop - 60; // Account for navbar

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// Game Catalog Loading
// ============================================
async function loadGames() {
    const gamesGrid = document.getElementById('gamesGrid');

    try {
        const response = await fetch('data/games.json');
        const games = await response.json();

        if (games.length === 0) {
            gamesGrid.innerHTML = `
                <div class="loading">
                    <p>No games available yet. Check back soon!</p>
                </div>
            `;
            return;
        }

        gamesGrid.innerHTML = games.map(game => createGameCard(game)).join('');

        // Add animation to cards
        animateCards();
    } catch (error) {
        console.error('Error loading games:', error);
        gamesGrid.innerHTML = `
            <div class="game-card">
                <div class="game-content">
                    <h3 class="game-title">Example Game</h3>
                    <p class="game-description">
                        Try the example game included with PixoSpritz. Explore zones, 
                        interact with NPCs, and experience the engine's capabilities.
                    </p>
                    <div class="game-links">
                        <a href="../example/build/index.html" target="_blank" class="game-link">
                            ▶️ Play Now
                        </a>
                        <a href="https://github.com/ConflictingTheories/calliope-pixos/tree/main/example" target="_blank" class="game-link">
                            📂 View Source
                        </a>
                    </div>
                </div>
            </div>
        `;

        animateCards();
    }
}

function createGameCard(game) {
    const imageSrc = game.image || 'assets/placeholder-game.png';
    const links = game.links || [];

    return `
        <div class="game-card reveal">
            <img src="${imageSrc}" alt="${game.title}" class="game-image" 
                 onerror="this.src='assets/placeholder-game.png'">
            <div class="game-content">
                <h3 class="game-title">${game.title}</h3>
                <p class="game-description">${game.description}</p>
                <div class="game-links">
                    ${links.map(link => `
                        <a href="${link.url}" target="_blank" class="game-link" ${link.external ? 'rel="noopener noreferrer"' : ''}>
                            ${link.icon} ${link.label}
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// ============================================
// Scroll Reveal Animations
// ============================================
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');

    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

function animateCards() {
    const cards = document.querySelectorAll('.game-card, .feature-card, .doc-card');

    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('reveal');
    });

    revealOnScroll();
}

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize config-based links
    initializeLinks();

    // Load games
    loadGames();

    // Setup scroll reveal
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // Add feature card animations
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('reveal');
    });
});

// ============================================
// Environment-specific Link Initialization
// ============================================
function initializeLinks() {
    const config = window.PixoSpritzConfig;

    if (config) {
        // Update demo link
        const demoLink = document.getElementById('demo-link');
        if (demoLink) {
            demoLink.href = config.current.demo;
        }

        // Update editor link
        const editorLink = document.getElementById('editor-link');
        if (editorLink) {
            editorLink.href = config.current.editor;
        }

        // Update dynamic console form
        const consoleForm = document.getElementById('dynamic-console-form');
        if (consoleForm) {
            consoleForm.action = config.current.console;
        }
    }
}

// ============================================
// Glitch Effect (Optional Enhancement)
// ============================================
function addGlitchEffect() {
    const glitchElements = document.querySelectorAll('.glitch');

    glitchElements.forEach(element => {
        const text = element.getAttribute('data-text');

        // Random glitch effect on hover
        element.addEventListener('mouseenter', () => {
            let iterations = 0;
            const interval = setInterval(() => {
                element.textContent = element.textContent
                    .split('')
                    .map((char, index) => {
                        if (index < iterations) {
                            return text[index];
                        }
                        return String.fromCharCode(33 + Math.floor(Math.random() * 94));
                    })
                    .join('');

                if (iterations >= text.length) {
                    clearInterval(interval);
                    element.textContent = text;
                }

                iterations += 1 / 3;
            }, 30);
        });
    });
}

// Apply glitch effect on load
document.addEventListener('DOMContentLoaded', addGlitchEffect);

// ============================================
// Performance Optimization
// ============================================

// Debounce function for scroll events
function debounce(func, wait = 10, immediate = true) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Optimize scroll events
window.addEventListener('scroll', debounce(() => {
    revealOnScroll();
}, 10));

// ============================================
// Easter Egg - Konami Code
// ============================================
(function () {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    function activateEasterEgg() {
        document.body.style.animation = 'rainbow 2s linear infinite';

        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);

        // Add rainbow animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
})();

// ============================================
// Analytics & Tracking (Placeholder)
// ============================================
function trackEvent(category, action, label) {
    // Integrate with your analytics service
    console.log('Event tracked:', { category, action, label });
}

// Track button clicks
document.querySelectorAll('.btn, .game-link, .demo-link').forEach(element => {
    element.addEventListener('click', () => {
        const label = element.textContent.trim();
        trackEvent('Button', 'Click', label);
    });
});
