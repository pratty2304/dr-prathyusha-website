// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
}));

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Improved navigation: only preventDefault for anchor links
// and always navigate immediately for other pages

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
            // Anchor link: smooth scroll
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                // Close mobile menu if open
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                // Calculate offset for fixed navbar
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        } else {
            // External page: navigate immediately
            window.location.href = href;
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 122, 255, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Mobile-specific scroll handling
let isScrolling = false;
window.addEventListener('scroll', () => {
    if (!isScrolling) {
        isScrolling = true;
        requestAnimationFrame(() => {
            isScrolling = false;
        });
    }
}, { passive: true });

// Intersection Observer for scroll animations
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

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.expertise-card, .treatment-card, .qualification-item, .contact-item');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add shadow to navbar on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
});

// Form handling with mobile optimizations
const appointmentForm = document.getElementById('appointmentForm');

if (appointmentForm) {
    // Get form elements
    const hospitalSelect = document.getElementById('hospital');
    const timeSelect = document.getElementById('appointmentTime');
    
    // Filter time options based on hospital selection
    if (hospitalSelect && timeSelect) {
        hospitalSelect.addEventListener('change', function() {
            const selectedHospital = this.value;
            const timeOptions = timeSelect.querySelectorAll('option');
            
            // Reset time selection
            timeSelect.value = '';
            
            // Show/hide time options based on hospital
            timeOptions.forEach(option => {
                if (option.value === '') {
                    // Keep the default "Select Preferred Time" option
                    option.style.display = 'block';
                } else {
                    const optionHospital = option.getAttribute('data-hospital');
                    if (selectedHospital === optionHospital) {
                        option.style.display = 'block';
                    } else {
                        option.style.display = 'none';
                    }
                }
            });
        });
    }
    
    appointmentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Simple validation
        if (!data.name || !data.email || !data.phone || !data.hospital || !data.appointmentTime) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // Phone validation
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
            showNotification('Please enter a valid phone number.', 'error');
            return;
        }
        
        // Simulate form submission
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        submitButton.textContent = 'Scheduling...';
        submitButton.disabled = true;
        
        try {
            // Send appointment request to server
            const response = await fetch('/api/appointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit appointment request');
            }
            
            const result = await response.json();
            
            showNotification('Thank you! Your appointment request has been submitted. We will contact you soon to confirm.', 'success');
            this.reset();
            
            // Reset time options visibility
            if (timeSelect) {
                const timeOptions = timeSelect.querySelectorAll('option');
                timeOptions.forEach(option => {
                    option.style.display = 'block';
                });
            }
            
            // Scroll to top on mobile after form submission
            if (window.innerWidth <= 768) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            
        } catch (error) {
            console.error('Error submitting appointment:', error);
            showNotification('There was an error submitting your appointment request. Please try again.', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

// Enhanced notification system for mobile
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Mobile-specific positioning
    const isMobile = window.innerWidth <= 768;
    const topPosition = isMobile ? '80px' : '100px';
    const rightPosition = isMobile ? '10px' : '20px';
    const maxWidth = isMobile ? 'calc(100vw - 20px)' : '400px';
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: ${topPosition};
        right: ${rightPosition};
        background: ${type === 'success' ? '#34C759' : type === 'error' ? '#FF3B30' : '#007AFF'};
        color: white;
        padding: ${isMobile ? '1rem' : '1rem 1.5rem'};
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: ${maxWidth};
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-family: inherit;
        font-size: ${isMobile ? '0.9rem' : '1rem'};
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Parallax effect for hero section (disabled on mobile for performance)
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image');
    
    // Only apply parallax on desktop
    if (hero && scrolled < hero.offsetHeight && window.innerWidth > 768) {
        const rate = scrolled * -0.5;
        heroContent.style.transform = `translateY(${rate * 0.3}px)`;
        heroImage.style.transform = `translateY(${rate * 0.1}px)`;
    }
});

// Enhanced button interactions for mobile
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        if (this.classList.contains('btn-primary')) {
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            // Use touch coordinates for mobile
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left - size / 2;
            const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        }
    });
    
    // Add touch feedback for mobile
    button.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
    });
    
    button.addEventListener('touchend', function() {
        this.style.transform = 'scale(1)';
    });
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Lazy loading for images (when you add actual images later)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Add smooth reveal animation for sections
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('section-revealed');
        }
    });
}, {
    threshold: 0.2
});

// Observe sections
document.querySelectorAll('section').forEach(section => {
    section.classList.add('section-hidden');
    sectionObserver.observe(section);
});

// Add CSS for section animations
const sectionStyle = document.createElement('style');
sectionStyle.textContent = `
    .section-hidden {
        opacity: 0;
        transform: translateY(50px);
        transition: opacity 0.8s ease, transform 0.8s ease;
    }
    
    .section-revealed {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(sectionStyle);

// Enhanced hover effects for cards (desktop only)
document.querySelectorAll('.expertise-card, .treatment-card').forEach(card => {
    if (window.innerWidth > 768) {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    }
});

// Add typing effect for hero title (optional enhancement)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title .gradient-text');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 80);
    }
});

// Add scroll progress indicator
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #007AFF, #5856D6);
        z-index: 10001;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Initialize scroll progress
document.addEventListener('DOMContentLoaded', createScrollProgress);

// Mobile-specific optimizations
function initMobileOptimizations() {
    // Prevent zoom on input focus (iOS)
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (window.innerWidth <= 768) {
                this.style.fontSize = '16px';
            }
        });
    });
    
    // Add touch feedback for interactive elements
    const touchElements = document.querySelectorAll('.expertise-card, .treatment-card, .qualification-item, .contact-item');
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Optimize scroll performance on mobile
    let ticking = false;
    function updateScroll() {
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScroll);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
}

// Initialize mobile optimizations
document.addEventListener('DOMContentLoaded', initMobileOptimizations);

// Handle orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        // Recalculate positions after orientation change
        window.scrollTo(0, window.scrollY);
    }, 100);
});

// Add viewport meta tag for better mobile experience
if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(viewport);
} 