# AI Hedge Fund UI Plan

## Overview

This UI plan outlines the development of a modern, intuitive interface for the AI Hedge Fund project. The UI will provide users with tools to run simulations, visualize results, and interact with the AI trading agents.

## Tech Stack

- **Framework**: Next.js
- **UI Library**: React
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui
- **Charts**: Recharts (to be added)
- **State Management**: React Context API
- **Data Fetching**: Native fetch API

## Pages & Features

### 1. Dashboard (Home Page)

**Purpose**: Main entry point and overview dashboard

**Components**:
- Header with app navigation and branding
- Summary statistics cards (total portfolio value, returns, etc.)
- Recent simulations list
- Quick action buttons
- Performance overview chart

### 2. Simulation Configuration

**Purpose**: Configure and run new simulations

**Components**:
- Enhanced simulation form with:
  - Multi-ticker selector with autocomplete
  - Date range picker
  - Initial cash input
  - Margin requirement setting
  - Analyst selection (multiple checkbox selection)
  - LLM model selection
  - Strategy parameters
- "Run Simulation" action button
- Saved configurations

### 3. Simulation Results

**Purpose**: Display detailed results of a simulation run

**Components**:
- Performance metrics cards
  - Total return
  - Annualized return
  - Sharpe ratio
  - Max drawdown
  - Win/loss ratio
- Interactive portfolio value chart
- Trade decisions table (with pagination)
- Analyst signals table (with filtering by analyst)
- Position history visualization
- Agent reasoning display (when requested)

### 4. Stock Analysis

**Purpose**: Detailed view of a specific stock with AI insights

**Components**:
- Interactive stock price chart with:
  - Candlestick view
  - Technical indicators overlay
  - Trade decision markers
- Fundamental data display
- AI analyst insights tabs (one for each agent)
- Latest news sentiment
- Key metrics visualization

### 5. Portfolio Management

**Purpose**: View and manage simulated portfolio

**Components**:
- Current holdings table
- Asset allocation chart
- Performance tracking
- Risk metrics display
- Rebalancing suggestions

### 6. Agent Configuration

**Purpose**: Configure and customize AI agents

**Components**:
- Agent selection interface
- Agent parameter configuration
- Agent performance comparison
- Custom agent creation form

## UI Enhancements

1. **Interactive Charts**:
   - Add candlestick charts for stock visualization
   - Create portfolio performance charts
   - Add technical indicator overlays

2. **Real-time Updates**:
   - Implement WebSocket for live simulation updates
   - Add progress indicators during simulation runs

3. **Responsive Design**:
   - Optimize layout for desktop, tablet, and mobile devices
   - Create alternative views for different screen sizes

4. **Accessibility Improvements**:
   - Implement keyboard navigation
   - Add screen reader support
   - Ensure proper contrast ratios

5. **Visual Design**:
   - Dark/light mode toggle
   - Custom theme with finance-oriented color scheme
   - Clean, modern aesthetic with data visualization focus

## Implementation Plan

### Phase 1: Core UI Framework
1. Set up base layout and navigation
2. Implement enhanced simulation form
3. Create results display components
4. Add basic charting functionality

### Phase 2: Enhanced Visualizations
1. Add interactive stock charts
2. Implement portfolio visualization
3. Create performance metrics dashboard
4. Develop agent comparison tools

### Phase 3: Advanced Features
1. Implement user preferences and settings
2. Add simulation saving/loading
3. Create strategy backtesting comparison
4. Develop custom agent configuration

### Phase 4: Polish & Optimization
1. Optimize performance
2. Enhance responsive design
3. Improve accessibility
4. Add animations and transitions

## Required shadcn Components

```bash
# Core components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add tabs
npx shadcn@latest add table
npx shadcn@latest add popover
npx shadcn@latest add calendar

# Additional components needed
npx shadcn@latest add accordion
npx shadcn@latest add alert
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add combobox
npx shadcn@latest add command
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add hover-card
npx shadcn@latest add pagination
npx shadcn@latest add progress
npx shadcn@latest add sheet
npx shadcn@latest add skeleton
npx shadcn@latest add slider
npx shadcn@latest add switch
npx shadcn@latest add toast
npx shadcn@latest add toggle
npx shadcn@latest add tooltip
```

## Additional Libraries to Install

```bash
# Chart libraries
npm install recharts
npm install d3

# Data handling and utilities
npm install date-fns
npm install zod
npm install zustand

# Additional UI enhancements
npm install framer-motion
npm install react-window
npm install @tanstack/react-table
```

## API Integration

Key endpoints to implement:
- `/api/simulation/run`: Start a new simulation
- `/api/simulation/results`: Get simulation results
- `/api/stocks/data`: Get historical stock data
- `/api/agents/list`: Get available agents
- `/api/models/list`: Get available LLM models
- `/api/portfolio/performance`: Get portfolio performance metrics

## Conclusion

This UI plan provides a comprehensive framework for developing an intuitive, powerful interface for the AI Hedge Fund application. The design focuses on data visualization, user experience, and providing deep insights into the AI trading process. 