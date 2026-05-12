/**
 * Main Application Module
 * Initializes app, sets up event listeners, orchestrates logic.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Initialization ---
    ThemeManager.init();
    Auth.init();
    CartManager.init();
    UIManager.setupTestimonials();

    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const genreFilter = document.getElementById('genre-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    // Auth Elements
    const authModal = document.getElementById('auth-modal');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const authForm = document.getElementById('auth-form');
    const authButtonsContainer = document.getElementById('auth-buttons');
    const userMenuContainer = document.getElementById('user-menu');
    const welcomeMsg = document.getElementById('welcome-msg');
    
    const switchAuthLink = document.getElementById('switch-auth-link');
    const switchAuthText = document.getElementById('switch-auth-text');
    const modalTitle = document.getElementById('modal-title');
    const submitAuthBtn = document.getElementById('submit-auth');
    const authErrorMsg = document.getElementById('auth-error');
    const authSuccessMsg = document.getElementById('auth-success');

    // Cart & Details Elements
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const checkoutBtn = document.getElementById('checkout-btn');
    const detailsModal = document.getElementById('book-details-modal');
    const contactModal = document.getElementById('contact-modal');
    const contactBtn = document.getElementById('contact-btn');

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    let currentAuthMode = 'login'; // 'login' or 'signup'

    // --- Core Functions ---

    const refreshLibrary = () => {
        const searchTerm = searchInput.value;
        const genre = genreFilter.value;
        const sortBy = sortFilter.value;

        let filteredBooks = FilterManager.filterBooks(window.BooksDB, searchTerm, genre, sortBy);
        
        // Handle new sorting: price-low
        if (sortBy === 'price-low') {
            filteredBooks.sort((a, b) => a.price - b.price);
        }

        UIManager.renderBooks(filteredBooks, Auth.getCurrentUser());
    };

    const updateHeaderState = () => {
        if (Auth.isLoggedIn()) {
            authButtonsContainer.classList.add('hidden');
            userMenuContainer.classList.remove('hidden');
            welcomeMsg.textContent = `Hello, ${Auth.getCurrentUser().email.split('@')[0]}`;
        } else {
            authButtonsContainer.classList.remove('hidden');
            userMenuContainer.classList.add('hidden');
        }
    };

    const updateStats = () => {
        const stats = FilterManager.getStats(window.BooksDB, Auth.getCurrentUser());
        UIManager.updateDashboard(stats);
    };

    // Load initial data with simulated delay for skeletons
    const loadInitialData = async () => {
        updateHeaderState();
        updateStats();
        UIManager.updateCartUI();

        // Fetch quote asynchronously
        const quote = await ApiManager.getQuote();
        UIManager.displayQuote(quote);

        // Simulate network loading for books
        UIManager.renderSkeletons(8);
        setTimeout(() => {
            refreshLibrary();
        }, 800); // 800ms simulated delay
    };

    // --- Event Listeners ---

    // Mobile Menu
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Filters
    searchInput.addEventListener('input', refreshLibrary);
    genreFilter.addEventListener('change', refreshLibrary);
    sortFilter.addEventListener('change', refreshLibrary);

    // Custom Events
    document.addEventListener('userDataChanged', () => {
        updateStats();
    });

    document.addEventListener('cartUpdated', () => {
        UIManager.updateCartUI();
    });

    // Global Modal Closure
    const closeAllModals = () => {
        authModal.classList.add('hidden');
        cartModal.classList.add('hidden');
        detailsModal.classList.add('hidden');
        contactModal.classList.add('hidden');
    };

    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.dataset.modal;
            if (modalId) {
                document.getElementById(modalId).classList.add('hidden');
            }
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });

    // --- Book Card Actions (Event Delegation) ---
    document.addEventListener('click', (e) => {
        // Add to Cart
        if (e.target.classList.contains('btn-add-cart')) {
            const bookId = e.target.dataset.id;
            CartManager.addToCart(bookId);
            // Optional: Provide visual feedback here if desired
            const originalText = e.target.textContent;
            e.target.textContent = "Added!";
            setTimeout(() => e.target.textContent = originalText, 1000);
        }

        // View Details
        if (e.target.closest('[data-action="details"]')) {
            const el = e.target.closest('[data-action="details"]');
            const bookId = el.dataset.id;
            UIManager.renderBookDetails(bookId);
            detailsModal.classList.remove('hidden');
        }

        // Cart Modal Actions (qty +/- and remove)
        if (e.target.classList.contains('qty-btn')) {
            const isPlus = e.target.classList.contains('plus');
            const bookId = e.target.dataset.id;
            const input = e.target.parentElement.querySelector('.qty-input');
            let currentQty = parseInt(input.value);
            CartManager.updateQuantity(bookId, isPlus ? currentQty + 1 : currentQty - 1);
        }

        if (e.target.classList.contains('cart-item-remove')) {
            const bookId = e.target.dataset.id;
            CartManager.removeFromCart(bookId);
        }

        // Favorite Button Toggle
        if (e.target.closest('[data-action="favorite"]')) {
            const btn = e.target.closest('[data-action="favorite"]');
            const bookId = btn.dataset.id;
            
            if (!Auth.isLoggedIn()) {
                openModal('login');
                return;
            }

            const user = Auth.getCurrentUser();
            if (user.favorites.includes(bookId)) {
                Auth.removeFavorite(bookId);
                btn.classList.remove('active');
                btn.textContent = '🤍';
            } else {
                Auth.addFavorite(bookId);
                btn.classList.add('active');
                btn.textContent = '❤️';
            }
            updateStats();
        }
    });

    // --- Cart Open ---
    cartBtn.addEventListener('click', () => {
        cartModal.classList.remove('hidden');
    });

    if (contactBtn && contactModal) {
        contactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            contactModal.classList.remove('hidden');
        });
    }

    checkoutBtn.addEventListener('click', () => {
        const cartData = CartManager.getCartData();
        if (cartData.items.length === 0) return;
        
        if (!Auth.isLoggedIn()) {
            cartModal.classList.add('hidden');
            openModal('login');
            return;
        }

        alert('Thank you for your purchase! Checkout functionality would proceed here.');
        CartManager.clearCart();
        cartModal.classList.add('hidden');
    });


    // --- Authentication Flow ---

    const openModal = (mode) => {
        currentAuthMode = mode;
        authErrorMsg.textContent = '';
        authSuccessMsg.classList.add('hidden');
        authForm.reset();
        
        if (mode === 'login') {
            modalTitle.textContent = 'Welcome Back';
            submitAuthBtn.textContent = 'Login';
            switchAuthText.textContent = "Don't have an account?";
            switchAuthLink.textContent = "Sign up";
        } else {
            modalTitle.textContent = 'Create Account';
            submitAuthBtn.textContent = 'Sign Up';
            switchAuthText.textContent = "Already have an account?";
            switchAuthLink.textContent = "Login";
        }
        
        authModal.classList.remove('hidden');
    };

    loginBtn.addEventListener('click', () => { openModal('login'); navMenu.classList.remove('active'); });
    signupBtn.addEventListener('click', () => { openModal('signup'); navMenu.classList.remove('active'); });

    switchAuthLink.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(currentAuthMode === 'login' ? 'signup' : 'login');
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        let result;
        if (currentAuthMode === 'login') {
            result = Auth.login(email, password);
        } else {
            result = Auth.signup(email, password);
        }

        if (result.success) {
            authErrorMsg.textContent = '';
            authSuccessMsg.textContent = currentAuthMode === 'login' ? 'Login successful!' : 'Account created!';
            authSuccessMsg.classList.remove('hidden');
            
            setTimeout(() => {
                authModal.classList.add('hidden');
                updateHeaderState();
                refreshLibrary(); 
                updateStats();
            }, 1000);
        } else {
            authSuccessMsg.classList.add('hidden');
            authErrorMsg.textContent = result.message;
        }
    });

    logoutBtn.addEventListener('click', () => {
        Auth.logout();
        updateHeaderState();
        refreshLibrary();
        updateStats();
        navMenu.classList.remove('active');
    });

    // Boot app
    loadInitialData();

});
