/**
 * Authentication Module
 * Uses closures to keep the current user state private.
 */

const Auth = (function() {
    // Private variables
    let currentUser = null;
    const USERS_KEY = 'll_users';
    const CURRENT_USER_KEY = 'll_current_user';

    // Initialize state from local storage
    const init = () => {
        const storedUser = AppStorage.get(CURRENT_USER_KEY);
        if (storedUser) {
            currentUser = storedUser;
        }
    };

    // Helper: Get all users
    const getUsers = () => AppStorage.get(USERS_KEY, []);

    // Public methods
    return {
        init: init,
        
        login: (email, password) => {
            const users = getUsers();
            // Array.find() to locate user
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                currentUser = user;
                AppStorage.set(CURRENT_USER_KEY, user);
                return { success: true, user };
            }
            return { success: false, message: 'Invalid email or password.' };
        },

        signup: (email, password) => {
            const users = getUsers();
            // Array.some() to check if user exists
            if (users.some(u => u.email === email)) {
                return { success: false, message: 'User already exists with this email.' };
            }

            const newUser = {
                id: Date.now().toString(),
                email: email,
                password: password, // In a real app, this would be hashed
                favorites: [],
                readingProgress: {} // { bookId: progressPercentage }
            };

            users.push(newUser);
            AppStorage.set(USERS_KEY, users);
            
            currentUser = newUser;
            AppStorage.set(CURRENT_USER_KEY, newUser);
            
            return { success: true, user: newUser };
        },

        logout: () => {
            currentUser = null;
            AppStorage.remove(CURRENT_USER_KEY);
            // We do not clear entirely because we want to keep registered users
        },

        getCurrentUser: () => currentUser,
        
        isLoggedIn: () => currentUser !== null,

        // User Data Management
        addFavorite: (bookId) => {
            if (!currentUser) return false;
            if (!currentUser.favorites.includes(bookId)) {
                currentUser.favorites.push(bookId);
                Auth.updateUserStorage();
            }
            return true;
        },

        removeFavorite: (bookId) => {
            if (!currentUser) return false;
            currentUser.favorites = currentUser.favorites.filter(id => id !== bookId);
            Auth.updateUserStorage();
            return true;
        },

        updateProgress: (bookId, percentage) => {
            if (!currentUser) return false;
            currentUser.readingProgress[bookId] = percentage;
            Auth.updateUserStorage();
            return true;
        },

        updateUserStorage: () => {
            if (!currentUser) return;
            // Update current user
            AppStorage.set(CURRENT_USER_KEY, currentUser);
            // Update user in users array
            const users = getUsers();
            const index = users.findIndex(u => u.id === currentUser.id);
            if (index !== -1) {
                users[index] = currentUser;
                AppStorage.set(USERS_KEY, users);
            }
        }
    };
})();

window.Auth = Auth;
