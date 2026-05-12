/**
 * Cart Manager Module
 * Handles cart logic using localStorage and array methods like reduce.
 */

const CartManager = (function() {
    const CART_KEY = 'll_cart';
    let cartItems = []; // Array of objects: { bookId, quantity }

    const init = () => {
        cartItems = AppStorage.get(CART_KEY, []);
    };

    const saveCart = () => {
        AppStorage.set(CART_KEY, cartItems);
        // Trigger event to update UI
        document.dispatchEvent(new CustomEvent('cartUpdated'));
    };

    const addToCart = (bookId) => {
        const existingItem = cartItems.find(item => item.bookId === bookId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.push({ bookId, quantity: 1 });
        }
        saveCart();
    };

    const removeFromCart = (bookId) => {
        cartItems = cartItems.filter(item => item.bookId !== bookId);
        saveCart();
    };

    const updateQuantity = (bookId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(bookId);
            return;
        }
        const item = cartItems.find(item => item.bookId === bookId);
        if (item) {
            item.quantity = parseInt(newQuantity);
            saveCart();
        }
    };

    const getCartData = () => {
        // Map cart items to actual book data
        const detailedCart = cartItems.map(item => {
            const book = window.BooksDB.find(b => b.id === item.bookId);
            return {
                ...book,
                quantity: item.quantity,
                subtotal: book.price * item.quantity
            };
        });

        // Use reduce to calculate total price and count
        const totalPrice = detailedCart.reduce((sum, item) => sum + item.subtotal, 0);
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

        return {
            items: detailedCart,
            totalPrice: totalPrice.toFixed(2),
            totalItems
        };
    };

    const clearCart = () => {
        cartItems = [];
        saveCart();
    };

    return {
        init,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartData,
        clearCart
    };
})();

window.CartManager = CartManager;
