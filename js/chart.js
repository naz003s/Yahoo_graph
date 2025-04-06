
//Chart module for creating and updating stock charts
 
const StockChart = {
    chart: null,
    
 
     // Initialize a new chart

    createChart(canvasId, stockData) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // If a chart already exists, destroy it
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Prepare data for Chart.js
        const labels = stockData.points.map(point => {
            const date = new Date(point.timestamp);
            return this.formatDate(date, stockData.range);
        });
        
        const data = stockData.points.map(point => point.close);
        
        // Determine chart color based on price change
        const isPositive = stockData.priceChange >= 0;
        const chartColor = isPositive ? 'rgb(46, 204, 113)' : 'rgb(231, 76, 60)';
        
        // Create chart configuration
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${stockData.symbol} Stock Price`,
                    data: data,
                    backgroundColor: this.createGradient(ctx, chartColor),
                    borderColor: chartColor,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: chartColor,
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: stockData.currency
                                    }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 0,
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: (value) => {
                                return new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: stockData.currency,
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }).format(value);
                            }
                        }
                    }
                }
            }
        };
        
        // Create the chart
        this.chart = new Chart(ctx, config);
    },
    

    createGradient(ctx, color) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        const rgbColor = color.replace('rgb', 'rgba').replace(')', ', 0.7)');
        gradient.addColorStop(0, rgbColor);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        return gradient;
    },
    

    formatDate(date, range) {
        const options = {};
        
        switch (range) {
            case '1d':
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            case '5d':
                options.month = 'short';
                options.day = 'numeric';
                options.hour = '2-digit';
                options.minute = '2-digit';
                break;
            case '1mo':
            case '3mo':
            case '6mo':
                options.month = 'short';
                options.day = 'numeric';
                break;
            case '1y':
                options.month = 'short';
                options.year = 'numeric';
                break;
            case '5y':
                options.month = 'short';
                options.year = 'numeric';
                break;
            default:
                options.month = 'short';
                options.day = 'numeric';
        }
        
        return date.toLocaleDateString([], options);
    }
};