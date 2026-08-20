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

    // Guide Modal Popup Controls
    const guideModal = document.getElementById('guideModal');

    window.openGuideModal = function(stepIdx = 0) {
        if (guideModal) {
            guideModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            goToStep(stepIdx);
        }
    };

    window.closeGuideModal = function() {
        if (guideModal) {
            guideModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    };

    // Close guide modal on clicking outside or ESC
    if (guideModal) {
        guideModal.addEventListener('click', (e) => {
            if (e.target === guideModal) {
                closeGuideModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && guideModal && guideModal.style.display === 'flex') {
            closeGuideModal();
        }
    });

    // When clicking any download link, open the Setup Guide Popup automatically after download begins
    document.querySelectorAll('a[download], .download-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(() => {
                openGuideModal(0);
            }, 600);
        });
    });
});

// === INTERACTIVE INSTALLATION GUIDE CONTROLLER ===
const guideSteps = [
    {
        num: 1,
        title: "Download & Double-Click ReconX_Setup.exe",
        desc: "Click the download button to get <code>ReconX_Setup.exe</code>, then open your Downloads folder and double-click the setup file.",
        img: "assets/guide/step1_download.png"
    },
    {
        num: 2,
        title: "If Windows SmartScreen appears: Click 'More info'",
        desc: "Because ReconX is a new software release, Windows may show a blue <em>'Windows protected your PC'</em> prompt. Click the underlined <strong>'More info'</strong> link.",
        img: "assets/guide/step2_smartscreen_info.png"
    },
    {
        num: 3,
        title: "Click the 'Run anyway' button",
        desc: "Click the white <strong>'Run anyway'</strong> button at the bottom. ReconX is 100% clean, verified, and runs entirely offline on your computer.",
        img: "assets/guide/step3_smartscreen_run.png"
    },
    {
        num: 4,
        title: "The Setup Wizard Opens: Click 'Next'",
        desc: "The installer wizard opens cleanly without requiring administrator privileges. Click <strong>'Next'</strong> to proceed.",
        img: "assets/guide/step4_wizard_next.png"
    },
    {
        num: 5,
        title: "Create Desktop Shortcut & Click 'Next'",
        desc: "Keep <em>'Create a desktop shortcut'</em> checked and click <strong>'Next' → 'Install'</strong>. ReconX installs cleanly in 3 seconds.",
        img: "assets/guide/step5_wizard_shortcut.png"
    },
    {
        num: 6,
        title: "Click 'Finish' — ReconX Launches Instantly!",
        desc: "Click <strong>'Finish'</strong>. ReconX will launch automatically and place a desktop shortcut icon on your PC ready to use anytime!",
        img: "assets/guide/step6_wizard_finish.png"
    }
];

let currentStepIndex = 0;

function goToStep(index) {
    if (index < 0 || index >= guideSteps.length) return;
    currentStepIndex = index;
    const step = guideSteps[index];

    const badge = document.getElementById('guideStepBadge');
    const title = document.getElementById('guideStepTitle');
    const desc = document.getElementById('guideStepDesc');
    const img = document.getElementById('guideStepImg');
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');

    if (badge) badge.innerText = `Step ${step.num} of 6`;
    if (title) title.innerText = step.title;
    if (desc) desc.innerHTML = step.desc;
    
    if (img) {
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = step.img;
            img.style.opacity = '1';
        }, 120);
    }

    // Update Pills
    document.querySelectorAll('.step-pill').forEach((pill, idx) => {
        if (idx === index) pill.classList.add('active');
        else pill.classList.remove('active');
    });

    // Update Dots
    document.querySelectorAll('.step-dot').forEach((dot, idx) => {
        if (idx === index) dot.classList.add('active');
        else dot.classList.remove('active');
    });

    // Update Prev / Next Buttons
    if (prevBtn) {
        if (index === 0) {
            prevBtn.disabled = true;
            prevBtn.style.opacity = '0.4';
            prevBtn.style.cursor = 'not-allowed';
        } else {
            prevBtn.disabled = false;
            prevBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';
        }
    }

    if (nextBtn) {
        if (index === guideSteps.length - 1) {
            nextBtn.innerHTML = `<span>Download Setup</span> <i class="ph ph-download-simple"></i>`;
            nextBtn.onclick = () => {
                window.location.href = "https://github.com/kavathiya-ayush/CA-Converter-Releases/raw/main/ReconX_Setup.exe";
            };
        } else {
            nextBtn.innerHTML = `<span>Next Step</span> <i class="ph ph-arrow-right"></i>`;
            nextBtn.onclick = nextStep;
        }
    }
}

function nextStep() {
    if (currentStepIndex < guideSteps.length - 1) {
        goToStep(currentStepIndex + 1);
    }
}

function prevStep() {
    if (currentStepIndex > 0) {
        goToStep(currentStepIndex - 1);
    }
}

