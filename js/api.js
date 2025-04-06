
const API = {

    baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/',
    
    /**
     * Fetch stock data from Yahoo Finance API
     * @param {string} symbol - Stock symbol e.g. AAPL
     * @param {string} range - Time range e.g. 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y
     * @returns {Promise} - Promise resolving to stock data
     */
    async fetchStockData(symbol, range) {
        try {
            // Building the Yahoo Finance API URL with parameters
            const interval = this.getIntervalFromRange(range);
            const url = `${this.baseUrl}${symbol}?range=${range}&interval=${interval}&includePrePost=false`;
            
            // Use a CORS proxy for development purposes
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Check if the response contains valid data
            if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
                throw new Error('No data available for this stock symbol');
            }
            
            return this.processStockData(data);
        } catch (error) {
            console.error('Error fetching stock data:', error);
            throw error;
        }
    },
    
    processStockData(data) {
        const result = data.chart.result[0];
        const meta = result.meta;
        const timestamps = result.timestamp || [];
        const quotes = result.indicators.quote[0];
        const adjClose = result.indicators.adjclose ? result.indicators.adjclose[0].adjclose : null;
        
        // Extract relevant data
        const stockData = {
            symbol: meta.symbol,
            currency: meta.currency,
            exchangeName: meta.exchangeName,
            instrumentType: meta.instrumentType,
            regularMarketPrice: meta.regularMarketPrice,
            previousClose: meta.previousClose,
            chartPreviousClose: meta.chartPreviousClose,
            dataGranularity: meta.dataGranularity,
            range: meta.range,
            timezone: meta.timezone,
            points: []
        };
        
        // Calculate price change and percentage
        stockData.priceChange = stockData.regularMarketPrice - stockData.previousClose;
        stockData.priceChangePercent = (stockData.priceChange / stockData.previousClose) * 100;
        
        // Create data points array
        for (let i = 0; i < timestamps.length; i++) {
            // Some points might be null or undefined, skip those
            if (quotes.close[i] !== null && quotes.close[i] !== undefined) {
                stockData.points.push({
                    timestamp: timestamps[i] * 1000, // Convert to milliseconds
                    open: quotes.open[i],
                    high: quotes.high[i],
                    low: quotes.low[i],
                    close: quotes.close[i],
                    volume: quotes.volume[i],
                    adjClose: adjClose ? adjClose[i] : quotes.close[i]
                });
            }
        }
        
        return stockData;
    },
    

    getIntervalFromRange(range) {
        switch (range) {
            case '1d': return '5m'; // 5 minutes
            case '5d': return '15m'; // 15 minutes
            case '1mo': return '1d'; // 1 day
            case '3mo': return '1d'; // 1 day
            case '6mo': return '1d'; // 1 day
            case '1y': return '1wk'; // 1 week
            case '5y': return '1mo'; // 1 month
            default: return '1d'; // Default to 1 day
        }
    }
};