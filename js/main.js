// ==================== js/main.js 完整整合内容 ====================

// 1. 首屏大图滚动放大特效
const heroContainer = document.getElementById('heroContainer');
const initialTitle = document.getElementById('initialTitle');
const heroWrapper = document.getElementById('heroWrapper');
const finalText = document.getElementById('finalText');

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    let progress = scrollTop / window.innerHeight;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    let currentWidth = 60 + (progress * 40);
    let currentHeight = 60 + (progress * 40);
    let currentRadius = 24 - (progress * 24);

    heroWrapper.style.width = `${currentWidth}vw`;
    heroWrapper.style.height = `${currentHeight}vh`;
    
    // 📌 注意这里：外部引入时，JS 控制 CSS 属性必须把 border-radius 改写为 borderRadius 
    heroWrapper.style.borderRadius = `${currentRadius}px`;

    initialTitle.style.opacity = 1 - (progress * 2);

    if (progress >= 0.95) {
        finalText.style.opacity = '1';
        finalText.style.transform = 'translateX(0)';
        heroWrapper.style.position = 'absolute';
        heroWrapper.style.top = 'auto';
        heroWrapper.style.bottom = '0';
        heroWrapper.style.transform = 'translate(-50%, 0)';
    } else {
        finalText.style.opacity = '0';
        finalText.style.transform = 'translateX(-30px)';
        heroWrapper.style.position = 'fixed';
        heroWrapper.style.top = '50%';
        heroWrapper.style.transform = 'translate(-50%, -50%)';
    }
});

// ==================== 2. 简介部分（中央4列横竖交替版）视口渐显观察器 ====================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

// 元素引用（用于序列化显现）
const introSection = document.querySelector('.intro-section');
const introTitleWrapper = document.querySelector('.intro-title-wrapper');
const introImgBoxes = document.querySelectorAll('.intro-carousel-track .intro-img-box');
const introTextWrapper = document.querySelector('.intro-text-wrapper');
const introCarouselContainer = document.querySelector('.intro-carousel-container');
const introScrollLeft = document.getElementById('introScrollLeft');
const introScrollRight = document.getElementById('introScrollRight');

// 观察整个 intro-section，然后按序显现内部元素，类似 Apple 官网的节奏
    if (introSection) {
    const baseDelay = 140;
    const step = 220;
    const seqObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (introTitleWrapper) introTitleWrapper.classList.add('show');

                introImgBoxes.forEach((box, i) => {
                    setTimeout(() => box.classList.add('show'), baseDelay + i * step);
                });

                // 文本段落统一由容器加 .show，内部段落会利用 CSS 过渡
                setTimeout(() => {
                    if (introTextWrapper) introTextWrapper.classList.add('show');
                }, baseDelay + introImgBoxes.length * step + 200);

                seqObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -12% 0px' });

    seqObserver.observe(introSection);
}

if (introCarouselContainer && introScrollLeft && introScrollRight) {
    const scrollStep = 1200; // 增大步长

    const easeInOutCubic = (t) => (t < 0.5)
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animateTo = (from, to, duration, easing, onComplete) => {
        const start = performance.now();
        const frame = (now) => {
            const elapsed = now - start;
            const p = Math.min(elapsed / duration, 1);
            introCarouselContainer.scrollLeft = from + (to - from) * easing(p);
            if (p < 1) requestAnimationFrame(frame);
            else if (onComplete) onComplete();
        };
        requestAnimationFrame(frame);
    };

    const animateScrollTo = (targetLeft) => {
        const maxScrollLeft = introCarouselContainer.scrollWidth - introCarouselContainer.clientWidth;
        targetLeft = Math.max(0, Math.min(maxScrollLeft, targetLeft));
        const startLeft = introCarouselContainer.scrollLeft;
        const distance = targetLeft - startLeft;
        if (Math.abs(distance) < 1) return;

        // 轻微超出量（按距离比例，限制最大值）
        const overshoot = Math.min(120, Math.abs(distance) * 0.06);
        const overshootTarget = Math.max(0, Math.min(maxScrollLeft, targetLeft + Math.sign(distance) * overshoot));

        const totalDur = 900;
        const dur1 = Math.round(totalDur * 0.68);
        const dur2 = totalDur - dur1;

        animateTo(startLeft, overshootTarget, dur1, easeInOutCubic, () => {
            animateTo(overshootTarget, targetLeft, dur2, easeOutCubic);
        });
    };

    introScrollLeft.addEventListener('click', () => {
        const targetLeft = Math.max(0, introCarouselContainer.scrollLeft - scrollStep);
        animateScrollTo(targetLeft);
    });

    introScrollRight.addEventListener('click', () => {
        const maxScrollLeft = introCarouselContainer.scrollWidth - introCarouselContainer.clientWidth;
        const targetLeft = Math.min(maxScrollLeft, introCarouselContainer.scrollLeft + scrollStep);
        animateScrollTo(targetLeft);
    });
}

// 3. End 部分鼠标滚轮联动横移轮播
const trackLarge = document.getElementById('trackLarge');
const trackSmall = document.getElementById('trackSmall');
let scrollPosition = 0;
let smallTrackOffset = -850; 

const endSection = document.querySelector('.end-section');
if (endSection) {
    endSection.addEventListener('wheel', (event) => {
        event.preventDefault();
        scrollPosition += event.deltaY * 0.6;

        if (scrollPosition < 0) scrollPosition = 0;
        if (scrollPosition > 1200) scrollPosition = 1200;

        trackLarge.style.transform = `translateX(${-scrollPosition}px)`;
        trackSmall.style.transform = `translateX(${smallTrackOffset + scrollPosition}px)`;
    }, { passive: false });
}
