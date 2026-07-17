/**
 * Aishwarya Tiwari - Portfolio Interactivity Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const body = document.body;
    const navbar = document.getElementById('navbar');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const mobileToggleBtn = document.getElementById('mobile-toggle');
    const navLinksContainer = document.getElementById('nav-links');
    const navLinks = document.querySelectorAll('.nav-link');
    const revealElements = document.querySelectorAll('.reveal');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    /* ==========================================================================
       Theme Switcher
       ========================================================================== */
    // Initialize theme based on local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.className = savedTheme + '-theme';
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        body.className = prefersDark ? 'dark-theme' : 'light-theme';
    }

    // Toggle theme on button click
    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
    });

    /* ==========================================================================
       Mobile Navigation Menu
       ========================================================================== */
    mobileToggleBtn.addEventListener('click', () => {
        navLinksContainer.classList.toggle('mobile-active');
        const icon = mobileToggleBtn.querySelector('i');
        if (navLinksContainer.classList.contains('mobile-active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinksContainer.classList.remove('mobile-active');
            mobileToggleBtn.querySelector('i').className = 'fa-solid fa-bars';
        });
    });

    /* ==========================================================================
       Navbar Scroll Effect & Active Section Tracker
       ========================================================================== */
    window.addEventListener('scroll', () => {
        // Sticky border and background blur on scroll
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Scroll Spy: Highlight nav link corresponding to current section
    const spyOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, spyOptions);

    // Observe all sections that have nav links
    document.querySelectorAll('section[id]').forEach(section => {
        spyObserver.observe(section);
    });

    /* ==========================================================================
       Scroll Reveal Animations
       ========================================================================== */
    const revealOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Once element is revealed, we can stop observing it
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    /* ==========================================================================
       Project Filtering System
       ========================================================================== */
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to current button
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            projectCards.forEach(card => {
                const cardTags = card.getAttribute('data-tags');
                
                // Reset card styling for transitions
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95) translateY(10px)';
                
                setTimeout(() => {
                    if (filterValue === 'all' || cardTags.includes(filterValue)) {
                        card.classList.remove('hide');
                        // Fade card back in
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1) translateY(0)';
                        }, 50);
                    } else {
                        card.classList.add('hide');
                    }
                }, 300); // Matches CSS transition duration
            });
        });
    });

    /* ==========================================================================
       Contact Form Submission
       ========================================================================== */
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnContent = submitBtn.innerHTML;
            
            // Disable button and show sending state
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
            
            // Simulating API network request
            setTimeout(() => {
                // Success message
                formStatus.className = 'form-status success';
                formStatus.textContent = 'Thank you, Aishwarya! Your message has been sent successfully. I will get back to you soon.';
                formStatus.classList.remove('hidden');
                
                // Reset form
                contactForm.reset();
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    formStatus.classList.add('hidden');
                    formStatus.className = 'form-status hidden';
                }, 5000);
                
            }, 1500);
        });
    }
});
