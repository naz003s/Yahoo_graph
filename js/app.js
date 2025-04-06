/**
 * Main application module
 */
document.addEventListener('DOMContentLoaded', () => {
    const stockSymbolInput = document.getElementById('stock-symbol');
    const timeRangeSelect = document.getElementById('time-range');
    const searchButton = document.getElementById('search-btn');
    const stockInfoElement = document.getElementById('stock-info');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    
    // Default to AAPL stock
    stockSymbolInput.value = 'AAPL';
    
    // Event Listeners
    searchButton.addEventListener('click', searchStock);
    stockSymbolInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchStock();
        }
    });
    
    // Search for a stock
    async function searchStock() {
        const symbol = stockSymbolInput.value.trim().toUpperCase();
        const range = timeRangeSelect.value;
        
        if (!symbol) {
            showError('Please enter a stock symbol');
            return;
        }
        
        try {
            showLoading();
            hideError();
            
            const stockData = await API.fetchStockData(symbol, range);
            
            updateStockInfo(stockData);
            StockChart.createChart('stock-chart', stockData);
            
            hideLoading();
            stockInfoElement.style.display = 'block';
        } catch (error) {
            hideLoading();
            showError(`Error: ${error.message}`);
            stockInfoElement.style.display = 'none';
        }
    }
    
    // Update stock information display
    function updateStockInfo(stockData) {
        const formattedPrice = formatCurrency(stockData.regularMarketPrice, stockData.currency);
        
        // Check if the price change values are valid numbers
        const priceChange = isNaN(stockData.priceChange) ? 0 : stockData.priceChange;
        const priceChangePercent = isNaN(stockData.priceChangePercent) ? 0 : stockData.priceChangePercent;
        
        const formattedChange = formatCurrency(priceChange, stockData.currency);
        const formattedPercent = priceChangePercent.toFixed(2) + '%';
        const changeClass = priceChange >= 0 ? 'positive' : 'negative';
        const changePrefix = priceChange >= 0 ? '+' : '';
        
        stockInfoElement.innerHTML = `
            <div class="stock-header">
                <div class="stock-name">
                    <h2>${stockData.symbol}</h2>
                    <p>${stockData.exchangeName}</p>
                </div>
                <div class="stock-price">
                    <div class="current-price">${formattedPrice}</div>
                    <div class="price-change ${changeClass}">
                        ${changePrefix}${formattedChange} (${changePrefix}${formattedPercent})
                    </div>
                </div>
            </div>
        `;
    }
    
    // Format currency value
    function formatCurrency(value, currency) {
        // Handle NaN or undefined values
        if (isNaN(value) || value === undefined) {
            return '$0.00';
        }
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }
    
    // Show loading spinner
    function showLoading() {
        loadingElement.style.display = 'flex';
    }
    
    // Hide loading spinner
    function hideLoading() {
        loadingElement.style.display = 'none';
    }
    
    // Show error message
    function showError(message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    // Hide error message
    function hideError() {
        errorElement.style.display = 'none';
    }
    
    // Initial stock search on page load
    searchStock();
});