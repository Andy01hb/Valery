// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const cursor = document.getElementById('cursor-glow');
    const musicBtn = document.getElementById('music-btn');
    const musicIcon = document.getElementById('music-icon');
    const music = document.getElementById('bg-music');
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    const progressBar = document.getElementById('scroll-progress');

    // 1. LOADER LOGIC
    window.addEventListener('load', () => {
        gsap.to(loader, {
            opacity: 0,
            duration: 2,
            ease: "power4.inOut",
            onComplete: () => {
                loader.style.display = 'none';
                initAnimations();
            }
        });
    });

    // 2. MOUSE TRACKING (Magic Trail & Glow)
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.6,
            ease: "power3.out"
        });
    });

    // 3. PARTICLE SYSTEM
    let particles = [];
    let particleMode = 'magic'; // 'magic' or 'pop'

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * (particleMode === 'magic' ? 2 : 5) + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = particleMode === 'magic' ? '#D4AF37' : `hsl(${Math.random() * 60 + 320}, 100%, 65%)`; // Golds for Ron, Pinks for Ramon
        }

        update() {
            // Mouse Interaction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
                this.x -= dx * 0.01;
                this.y -= dy * 0.01;
            }

            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }

        draw() {
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 150; i++) particles.push(new Particle());

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // 4. GSAP ANIMATIONS
    function initAnimations() {
        // Reveal elements on scroll
        gsap.utils.toArray('.reveal').forEach(el => {
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                opacity: 1,
                y: 0,
                duration: 2,
                ease: "expo.out"
            });
        });

        // Parallax Items
        gsap.utils.toArray('.parallax-item').forEach(item => {
            const speed = item.getAttribute('data-speed') || 0.5;
            gsap.to(item, {
                y: (i, target) => -500 * speed,
                ease: "none",
                scrollTrigger: {
                    trigger: item,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            });
        });

        // Background & Theme Transition
        ScrollTrigger.create({
            trigger: "main",
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
                const prog = self.progress;

                // Progress Bar
                progressBar.style.width = (prog * 100) + "%";

                // Background Color Morphing
                // Ron (Indigo/Deep Blue) -> Ramon (Light Pink/Pop Blue)
                const hue = gsap.utils.interpolate(240, 330, prog);
                const saturation = gsap.utils.interpolate(30, 80, prog);
                const lightness = gsap.utils.interpolate(5, 15, prog);

                document.getElementById('main-canvas-bg').style.background =
                    activeTheme(prog);

                // Particle mode switch
                if (prog > 0.5 && particleMode === 'magic') {
                    particleMode = 'pop';
                    particles.forEach(p => p.reset());
                    gsap.to(cursor, { background: "radial-gradient(circle, rgba(255, 0, 127, 0.15) 0%, transparent 70%)", duration: 1 });
                } else if (prog <= 0.5 && particleMode === 'pop') {
                    particleMode = 'magic';
                    particles.forEach(p => p.reset());
                    gsap.to(cursor, { background: "radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)", duration: 1 });
                }
            }
        });
    }

    function activeTheme(p) {
        if (p < 0.3) return `linear-gradient(180deg, #0a0a0f 0%, #0f0c29 100%)`; // Magic/Ron
        if (p < 0.7) return `linear-gradient(180deg, #0f0c29 0%, #1a1b3a 100%)`; // Transition
        return `linear-gradient(180deg, #1a1b3a 0%, #2e1a3a 100%)`; // Pop/Ramon
    }

    // 5. MUSIC LOADER
    let isPlaying = false;

    // Predescargar el audio si es posible
    music.load();

    musicBtn.addEventListener('click', () => {
        if (!isPlaying) {
            // Iniciar reproducción y manejar promesas
            const playPromise = music.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log("Audio iniciado correctamente.");
                    musicIcon.textContent = "⏸";
                    musicBtn.style.boxShadow = "0 0 20px rgba(255, 0, 127, 0.4)";
                    isPlaying = true;
                }).catch(error => {
                    console.error("Fallo al reproducir audio:", error);
                    alert("¡Vaya! Hubo un problema al cargar la música. Asegúrate de que el enlace sea correcto o intenta recargar la página.");
                    musicIcon.textContent = "❌";
                });
            }
        } else {
            music.pause();
            console.log("Audio pausado.");
            musicIcon.textContent = "🔊";
            musicBtn.style.boxShadow = "none";
            isPlaying = false;
        }
    });

    // 6. CELEBRATE (Confetti)
    window.celebrate = function () {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };
});
