/**
 * API Module
 * Demonstrates Asynchronous JavaScript (async/await, fetch)
 */

const ApiManager = (function() {
    
    // Fetch a random quote from Quotable API
    const fetchRandomQuote = async () => {
        try {
            const response = await fetch('https://api.quotable.io/random?tags=literature|wisdom');
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            return {
                text: data.content,
                author: data.author
            };
        } catch (error) {
            console.error('Failed to fetch quote:', error);
            // Fallback quote if API fails
            return {
                text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.",
                author: "George R.R. Martin"
            };
        }
    };

    return {
        getQuote: fetchRandomQuote
    };
})();

window.ApiManager = ApiManager;
