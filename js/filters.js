/**
 * Filters & Search Module
 * Utilizes Array Higher Order Functions: filter(), sort(), reduce()
 */

const FilterManager = (function() {
    
    // Pure function to apply all filters and search term
    const applyFilters = (books, searchTerm, genre, sortBy) => {
        
        // 1. Array.filter() for search
        let filteredBooks = books.filter(book => {
            const titleMatch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
            const authorMatch = book.author.toLowerCase().includes(searchTerm.toLowerCase());
            return titleMatch || authorMatch;
        });

        // 2. Array.filter() for genre
        if (genre !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.genre === genre);
        }

        // 3. Array.sort() for sorting options
        switch (sortBy) {
            case 'a-z':
                filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'rating':
                filteredBooks.sort((a, b) => b.rating - a.rating); // Descending
                break;
            case 'recent':
                filteredBooks.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)); // Descending
                break;
            case 'default':
            default:
                // Sort by popularity as default
                filteredBooks.sort((a, b) => b.popularity - a.popularity);
                break;
        }

        return filteredBooks;
    };

    // Calculate Statistics using Array.reduce()
    const calculateStats = (books, user) => {
        const totalBooks = books.length;
        
        // Count favorites
        const favoritesCount = user ? user.favorites.length : 0;
        
        // Calculate average progress
        let avgProgress = 0;
        if (user && Object.keys(user.readingProgress).length > 0) {
            const progressVals = Object.values(user.readingProgress);
            const totalProgress = progressVals.reduce((sum, current) => sum + parseInt(current), 0);
            avgProgress = Math.round(totalProgress / progressVals.length);
        }

        return {
            total: totalBooks,
            favorites: favoritesCount,
            progress: avgProgress
        };
    };

    return {
        filterBooks: applyFilters,
        getStats: calculateStats
    };
})();

window.FilterManager = FilterManager;
