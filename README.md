# 📊 Portfolio Tracker & Optimizer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/python-%3E%3D3.8-blue)](https://www.python.org/)

An advanced Node.js web application designed to help investors track and optimize their investment portfolios using modern financial theory and machine learning.

## 🚀 Overview

Portfolio Tracker & Optimizer is a comprehensive investment management tool that combines real-time market data with sophisticated analytics to provide users with actionable insights into their investment portfolios. Built with Modern Portfolio Theory at its core, the application offers optimization recommendations based on the Markowitz Efficient Frontier model.

> 🎯 **Premium Feature Preview**: LSTM prediction model is already developed and available in `LSTM-Prediction-Portfolio-Optimisation.ipynb`. Integration as a premium forecasting feature is coming soon!

## ✨ Key Features

### 📈 Portfolio Management
- **Manual Asset Entry**: Add cryptocurrencies, stocks, or ETFs with intelligent auto-complete functionality
- **Real-Time Price Updates**: Live market data integration via CoinAPI.io and Investing.com APIs
- **Multi-Asset Support**: Comprehensive support for cryptocurrencies, stocks, and ETFs
- **Portfolio Tracking**: Monitor total portfolio value, gains/losses, and performance metrics

### 📊 Analytics & Visualization
- **Interactive Dashboard**: Real-time portfolio overview with dynamic charts
- **Asset Allocation**: Visual breakdown of portfolio composition and weightings
- **Historical Performance**: Track portfolio performance trends over time
- **Performance Metrics**: Calculate Sharpe ratio, volatility, and other key indicators

### 🎯 Optimization Tools
- **Markowitz Efficient Frontier**: Visualize optimal risk-return combinations
- **Portfolio Optimization**: Get recommendations for maximum return and minimum risk allocations
- **Rebalancing Suggestions**: Receive buy/sell recommendations to optimize your portfolio
- **Risk Analysis**: Comprehensive risk assessment and diversification metrics

### 📋 Reporting & Export
- **Performance Reports**: Generate detailed portfolio analysis reports
- **Export Functionality**: Download data in PDF and Excel formats
- **Historical Data**: Access and export historical performance data
- **Custom Reports**: Create personalized reporting templates

### 👤 User Experience
- **Secure Authentication**: User registration and login system
- **Multiple Portfolios**: Manage multiple investment portfolios per account
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Personalized Settings**: Customizable dashboard and preferences

### 🤖 Machine Learning (Coming Soon)
- **LSTM Price Prediction**: Advanced neural network model for forecasting asset prices
- **Portfolio Return Forecasting**: Predict future portfolio performance
- **Risk Prediction**: ML-powered risk assessment and volatility forecasting

## 🛠 Tech Stack

### Frontend
- **HTML5/CSS3**: Modern, responsive web interface
- **JavaScript (ES6+)**: Dynamic user interactions and real-time updates
- **Chart.js**: Interactive data visualization and charting

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **RESTful APIs**: Clean, scalable API architecture

### Data & Analytics
- **CoinAPI.io**: Cryptocurrency market data
- **Investing.com API**: Stock and ETF market data
- **Python**: Financial calculations and optimization algorithms
- **NumPy/Pandas**: Data processing and analysis
- **Matplotlib/Seaborn**: Advanced data visualization

### Machine Learning
- **TensorFlow/Keras**: Deep learning framework for LSTM models
- **scikit-learn**: Machine learning utilities and preprocessing
- **Jupyter Notebook**: Interactive development environment for ML models

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **Python** (v3.8 or higher) - for optimization algorithms
- **Git** - for version control

### Required Python Packages
```bash
pip install numpy pandas matplotlib scikit-learn tensorflow jupyter
```

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/portfolio-tracker-optimizer.git
cd portfolio-tracker-optimizer
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies (for optimization features)
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# API Keys
COINAPI_KEY=your_coinapi_key_here
INVESTING_API_KEY=your_investing_api_key_here

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portfolio_tracker
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Application Settings
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
```

### 4. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## 📊 LSTM Prediction Model

The LSTM (Long Short-Term Memory) neural network model for portfolio optimization is available in the Jupyter notebook:

### Running the LSTM Model
```bash
# Navigate to project directory
cd portfolio-tracker-optimizer

# Launch Jupyter Notebook
jupyter notebook LSTM-Prediction-Portfolio-Optimisation.ipynb
```

The notebook contains:
- Data preprocessing and feature engineering
- LSTM model architecture and training
- Portfolio return predictions
- Performance evaluation and backtesting
- Visualization of prediction results

> **Note**: This model will be integrated into the main application as a premium feature in upcoming releases.

## 📁 Project Structure

```
portfolio-tracker-optimizer/
├── 📁 public/                 # Static assets
│   ├── 📁 css/               # Stylesheets
│   ├── 📁 js/                # Client-side JavaScript
│   └── 📁 images/            # Images and icons
├── 📁 src/                   # Source code
│   ├── 📁 controllers/       # Request handlers
│   ├── 📁 models/            # Data models
│   ├── 📁 routes/            # API routes
│   ├── 📁 services/          # Business logic
│   └── 📁 utils/             # Utility functions
├── 📁 python/                # Python optimization scripts
│   ├── markowitz.py          # Portfolio optimization
│   └── efficient_frontier.py # Efficient frontier calculation
├── 📄 LSTM-Prediction-Portfolio-Optimisation.ipynb
├── 📄 package.json           # Node.js dependencies
├── 📄 requirements.txt       # Python dependencies
├── 📄 .env.example          # Environment variables template
└── 📄 README.md             # Project documentation
```

## 🔧 Configuration

### API Setup
1. **CoinAPI.io**: Sign up at [coinapi.io](https://www.coinapi.io/) to get your API key
2. **Investing.com**: Register for API access at [investing.com](https://www.investing.com/)
3. Add your API keys to the `.env` file

### Database Setup
The application supports multiple database options. Configure your preferred database in the `.env` file.

## 🤝 Contributing

We welcome contributions from the community! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Commit your changes**: `git commit -m 'Add some feature'`
4. **Push to the branch**: `git push origin feature/your-feature-name`
5. **Submit a pull request**

## 📊 Performance Metrics

The application tracks various performance metrics:
- **Portfolio Return**: Total and annualized returns
- **Sharpe Ratio**: Risk-adjusted return measurement
- **Maximum Drawdown**: Largest peak-to-trough decline
- **Volatility**: Standard deviation of returns
- **Beta**: Portfolio sensitivity to market movements

## 🔒 Security

- JWT-based authentication
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure environment variable handling
- HTTPS enforcement in production

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Modern Portfolio Theory** - Harry Markowitz
- **CoinAPI.io** - Cryptocurrency market data
- **Investing.com** - Stock market data
- **TensorFlow Team** - Machine learning framework
- **Chart.js Community** - Data visualization library

## 📞 Support

If you encounter any issues or have questions:

1. **Check the [Issues](https://github.com/yourusername/portfolio-tracker-optimizer/issues)** page for existing solutions
2. **Create a new issue** with detailed description and steps to reproduce

## 🗺 Roadmap

### Upcoming Features
- [ ] LSTM model integration as premium feature
- [ ] Advanced portfolio analytics
- [ ] Social trading features
- [ ] Mobile application
- [ ] Automated rebalancing
- [ ] Tax optimization tools
- [ ] Multi-currency support
- [ ] Real-time notifications

### Version History
- **v1.2.0** - Added LSTM prediction model (notebook only)
- **v1.1.0** - Portfolio optimization features
- **v1.0.0** - Initial release with basic portfolio tracking

---

⭐ **If you find this project helpful, please consider giving it a star!** ⭐
