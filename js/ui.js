/**
 * UI Module
 * Handles all DOM manipulation, dynamic rendering, and animations.
 */

const UIManager = (function() {
    
    // DOM Elements
    const elements = {
        booksGrid: document.getElementById('books-grid'),
        noResults: document.getElementById('no-results'),
        quoteText: document.getElementById('daily-quote'),
        quoteAuthor: document.getElementById('quote-author'),
        statsTotal: document.getElementById('stat-total'),
        statsFavs: document.getElementById('stat-favorites'),
        testimonialSlider: document.getElementById('testimonial-slider'),
        cartBadge: document.getElementById('cart-badge'),
        cartContainer: document.getElementById('cart-items-container'),
        cartTotal: document.getElementById('cart-total-price'),
        bookDetailsContainer: document.getElementById('book-details-container')
    };

    // --- Loading Skeletons ---
    const renderSkeletons = (count = 8) => {
        elements.booksGrid.innerHTML = '';
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton skeleton-card';
            fragment.appendChild(skeleton);
        }
        elements.booksGrid.appendChild(fragment);
    };

    // --- Book Rendering ---
    const createBookCard = (book, user) => {
        const isFavorite = user && user.favorites.includes(book.id);
        const progress = (user && user.readingProgress[book.id]) ? user.readingProgress[book.id] : 0;
        
        const card = document.createElement('div');
        card.className = 'book-card fade-in';
        card.dataset.id = book.id;

        const badgeHtml = book.popularity >= 95 ? `<div class="badge-bestseller">Bestseller</div>` : '';

        card.innerHTML = `
            ${badgeHtml}
            <div class="book-cover" data-action="details" data-id="${book.id}">
                <img src="${book.coverUrl}" alt="${book.title} cover" loading="lazy">
                <div class="book-overlay">
                    <span class="btn btn-primary">View Details</span>
                </div>
            </div>
            <div class="book-info">
                <span class="book-genre">${book.genre}</span>
                <h3 class="book-title" data-action="details" data-id="${book.id}">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <div class="book-meta">
                    <div class="book-rating">
                        ${'★'.repeat(Math.round(book.rating))}${'☆'.repeat(5 - Math.round(book.rating))} 
                        <span>(${book.rating})</span>
                    </div>
                    <div class="book-price">₹${book.price.toFixed(2)}</div>
                </div>
                <div class="book-actions">
                    <button class="btn btn-primary btn-add-cart" data-id="${book.id}">Add to Cart</button>
                    <button class="btn-fav ${isFavorite ? 'active' : ''}" data-action="favorite" data-id="${book.id}" aria-label="Favorite">
                        ${isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        `;

        return card;
    };

    const renderBooks = (booksArray, user) => {
        elements.booksGrid.innerHTML = '';
        
        if (booksArray.length === 0) {
            elements.noResults.classList.remove('hidden');
            return;
        }
        
        elements.noResults.classList.add('hidden');
        
        const fragment = document.createDocumentFragment();
        booksArray.map(book => createBookCard(book, user))
                  .forEach(card => fragment.appendChild(card));
                  
        elements.booksGrid.appendChild(fragment);
    };

    // --- Cart Rendering ---
    const updateCartUI = () => {
        const cartData = CartManager.getCartData();
        
        // Update badge
        elements.cartBadge.textContent = cartData.totalItems;
        
        // Update total
        elements.cartTotal.textContent = cartData.totalPrice;

        // Render Items
        elements.cartContainer.innerHTML = '';
        
        if (cartData.items.length === 0) {
            elements.cartContainer.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        
        cartData.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.coverUrl}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <span class="cart-item-price">₹${item.price.toFixed(2)}</span>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn minus" data-id="${item.id}">-</button>
                    <input type="text" class="qty-input" value="${item.quantity}" readonly>
                    <button class="qty-btn plus" data-id="${item.id}">+</button>
                    <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">🗑️</button>
                </div>
            `;
            fragment.appendChild(div);
        });

        elements.cartContainer.appendChild(fragment);
    };

    // --- Details Modal Rendering ---
    const renderBookDetails = (bookId) => {
        const book = window.BooksDB.find(b => b.id === bookId);
        if (!book) return;

        let reviewsHtml = '';
        if (book.reviews && book.reviews.length > 0) {
            reviewsHtml = `
                <div class="detail-reviews">
                    <h4>Reader Reviews</h4>
                    ${book.reviews.map(r => `<div class="review-item">"${r}"</div>`).join('')}
                </div>
            `;
        }

        elements.bookDetailsContainer.innerHTML = `
            <div class="detail-img-container">
                <img src="${book.coverUrl}" alt="${book.title} cover">
            </div>
            <div class="detail-info">
                <h2>${book.title}</h2>
                <p class="detail-author">by ${book.author}</p>
                <div class="detail-meta">
                    <span class="book-genre">${book.genre}</span>
                    <span class="book-rating">★ ${book.rating}</span>
                </div>
                <p class="detail-desc">${book.description}</p>
                <div class="detail-price">₹${book.price.toFixed(2)}</div>
                <button class="btn btn-primary btn-large btn-add-cart full-width" data-id="${book.id}">Add to Cart</button>
                ${reviewsHtml}
            </div>
        `;
    };


    // --- Dashboard & Utilities ---
    const animateValue = (obj, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
        
        obj.classList.remove('counter-animate');
        void obj.offsetWidth;
        obj.classList.add('counter-animate');
    };

    const updateDashboard = (stats) => {
        animateValue(elements.statsTotal, 0, stats.total, 1000);
        animateValue(elements.statsFavs, 0, stats.favorites, 1000);
    };

    const displayQuote = (quoteObj) => {
        elements.quoteText.textContent = `"${quoteObj.text}"`;
        elements.quoteAuthor.textContent = `- ${quoteObj.author}`;
    };

    const setupTestimonials = () => {
        const testimonials = [
            { text: "Literary Lounge completely changed how I track my reading. The interface is stunning.", author: "Sarah Jenkins" },
            { text: "Finally, a platform that feels like a premium digital library. Highly recommended.", author: "Marcus Aurelius" },
            { text: "The dark mode is perfect for my late-night reading sessions.", author: "Emily Chen" }
        ];

        let currentIndex = 0;
        const renderTestimonial = (index) => {
            const t = testimonials[index];
            elements.testimonialSlider.innerHTML = `
                <div class="testimonial-card active">
                    <p class="testimonial-text">"${t.text}"</p>
                    <h4 class="testimonial-author">${t.author}</h4>
                </div>
            `;
        };
        renderTestimonial(0);
        setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            renderTestimonial(currentIndex);
        }, 5000);
    };

    return {
        renderBooks,
        renderSkeletons,
        updateCartUI,
        renderBookDetails,
        updateDashboard,
        displayQuote,
        setupTestimonials
    };

})();

window.UIManager = UIManager;
