/**
 * Lazy Loading for Images
 * This script defers loading of images until they're about to enter the viewport,
 * helping improve initial page load performance.
 */
(function() {
    // Check for IntersectionObserver support
    if ('IntersectionObserver' in window) {
        // Lazy load images with data-src attribute
        const lazyImageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    
                    // If the target has a data-src attribute, load the image
                    if (lazyImage.dataset.src) {
                        lazyImage.src = lazyImage.dataset.src;
                        lazyImage.removeAttribute('data-src');
                    }
                    
                    // If the target has a data-srcset attribute, set the srcset
                    if (lazyImage.dataset.srcset) {
                        lazyImage.srcset = lazyImage.dataset.srcset;
                        lazyImage.removeAttribute('data-srcset');
                    }
                    
                    // If the target has a data-bg attribute, set the background image
                    if (lazyImage.dataset.bg) {
                        lazyImage.style.backgroundImage = `url(${lazyImage.dataset.bg})`;
                        lazyImage.removeAttribute('data-bg');
                    }
                    
                    // Add a loaded class when the image is loaded
                    lazyImage.classList.add('loaded');
                    
                    // Remove observer after loading image
                    observer.unobserve(lazyImage);
                }
            });
        }, {
            rootMargin: '200px 0px', // Start loading 200px before it enters viewport
            threshold: 0.01
        });

        // Observe all images with data-src, data-srcset, or data-bg attributes
        document.addEventListener('DOMContentLoaded', function() {
            // Select and observe all images with data-src
            const lazyImages = [].slice.call(document.querySelectorAll('img[data-src]'));
            lazyImages.forEach(function(lazyImage) {
                lazyImageObserver.observe(lazyImage);
            });
            
            // Select and observe all elements with data-bg (for background images)
            const lazyBackgrounds = [].slice.call(document.querySelectorAll('[data-bg]'));
            lazyBackgrounds.forEach(function(lazyBackground) {
                lazyImageObserver.observe(lazyBackground);
            });
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        document.addEventListener('DOMContentLoaded', function() {
            const lazyImages = [].slice.call(document.querySelectorAll('img[data-src]'));
            const lazyBackgrounds = [].slice.call(document.querySelectorAll('[data-bg]'));
            
            // Simple fallback - load all images immediately
            lazyImages.forEach(function(lazyImage) {
                if (lazyImage.dataset.src) {
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.removeAttribute('data-src');
                }
                if (lazyImage.dataset.srcset) {
                    lazyImage.srcset = lazyImage.dataset.srcset;
                    lazyImage.removeAttribute('data-srcset');
                }
                lazyImage.classList.add('loaded');
            });
            
            lazyBackgrounds.forEach(function(lazyBackground) {
                if (lazyBackground.dataset.bg) {
                    lazyBackground.style.backgroundImage = `url(${lazyBackground.dataset.bg})`;
                    lazyBackground.removeAttribute('data-bg');
                }
                lazyBackground.classList.add('loaded');
            });
        });
    }
})(); 