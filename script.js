// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggler
    const themeToggleBtn = document.getElementById('themeToggle');
    const htmlEl = document.documentElement;
    const iconEl = themeToggleBtn.querySelector('i');

    // Check for saved theme
    const savedTheme = localStorage.getItem('reconx_marketing_theme');
    if (savedTheme) {
        htmlEl.setAttribute('data-theme', savedTheme);
        updateIcon(savedTheme);
    } else {
        // Default to dark theme
        htmlEl.setAttribute('data-theme', 'dark');
        updateIcon('dark');
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('reconx_marketing_theme', newTheme);
        updateIcon(newTheme);
    });

    function updateIcon(theme) {
        if (theme === 'dark') {
            iconEl.classList.remove('ph-moon');
            iconEl.classList.add('ph-sun');
        } else {
            iconEl.classList.remove('ph-sun');
            iconEl.classList.add('ph-moon');
        }
    }

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    /* Animated Liquid Flow Background */
    const canvas = document.getElementById('fluidCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.style.filter = 'blur(60px)'; // High blur for a soft, ambient "light in the dark" glow
        
        let width, height;
        let blobs = [];
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let themeColors = {};

        function updateThemeColors() {
            const style = getComputedStyle(document.documentElement);
            themeColors = {
                primary: style.getPropertyValue('--bg-primary').trim(),
                c1: style.getPropertyValue('--accent-blue').trim(),
                c2: style.getPropertyValue('--accent-blue-deep').trim(),
                c3: style.getPropertyValue('--text-accent').trim(),
                c4: style.getPropertyValue('--accent-blue').trim(),
            };
        }
        
        // Initial color fetch
        updateThemeColors();

        // Re-fetch colors when theme toggle is clicked
        themeToggleBtn.addEventListener('click', () => {
            setTimeout(updateThemeColors, 50); 
        });

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }
        window.addEventListener('resize', resize);
        resize();

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            // Retain the CSS variables for subtle glows in other UI elements
            document.documentElement.style.setProperty('--mouse-x', `${(mouseX / width) * 100}%`);
            document.documentElement.style.setProperty('--mouse-y', `${(mouseY / height) * 100}%`);
        });

        class Blob {
            constructor(colorKey, index) {
                this.originX = window.innerWidth / 2;
                this.originY = window.innerHeight / 2;
                this.x = this.originX;
                this.y = this.originY;
                this.vx = 0;
                this.vy = 0;
                
                // Specific round shape for a soft centralized light
                this.radius = 220 + (Math.random() * 40); 
                
                this.colorKey = colorKey;
                this.angle = Math.random() * Math.PI * 2;
                
                // Very tight offset so they form a single central cohesive shape
                this.offsetX = Math.cos(this.angle) * (index * 30);
                this.offsetY = Math.sin(this.angle) * (index * 30);
            }
            
            update() {
                const mouseNormX = (mouseX - (width / 2)) / (width / 2);
                const mouseNormY = (mouseY - (height / 2)) / (height / 2);
                
                const targetX = (width / 2) + (mouseNormX * 100) + this.offsetX;
                const targetY = (height / 2) + (mouseNormY * 100) + this.offsetY;

                const dx = targetX - this.x;
                const dy = targetY - this.y;
                this.vx += dx * 0.005; // Spring strength
                this.vy += dy * 0.005;
                
                this.angle += 0.01;
                this.vx += Math.cos(this.angle) * 0.2;
                this.vy += Math.sin(this.angle) * 0.2;

                this.vx *= 0.92;
                this.vy *= 0.92;
                
                this.x += this.vx;
                this.y += this.vy;
            }
            
            draw(ctx) {
                ctx.beginPath();
                ctx.fillStyle = themeColors[this.colorKey];
                ctx.globalAlpha = 0.45; // Soften the opacity so it acts as ambient center light
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        }

        const colorKeys = ['c1', 'c2', 'c3'];
        for (let i = 0; i < 3; i++) {
            blobs.push(new Blob(colorKeys[i], i));
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            ctx.fillStyle = themeColors.primary;
            ctx.fillRect(0, 0, width, height);
            
            ctx.globalCompositeOperation = 'source-over'; 

            blobs.forEach(blob => {
                blob.update();
                blob.draw(ctx);
            });
            requestAnimationFrame(animate);
        }

        animate();
    }
});
