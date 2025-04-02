# AI Hedge Fund UI Migration Plan

This document outlines our step-by-step approach to migrate the AI Hedge Fund application from command-line to a web-based UI. Each phase ensures we maintain existing functionality while progressively adding UI components.

## Phase 1: Project Setup and Foundation ✅

1. **Create Web Application Directory** ✅
   - Create a `web/` directory at the project root
   - Initialize a Next.js application with TypeScript, Tailwind CSS, and ESLint
   ```bash
   mkdir web
   cd web
   npx create-next-app@latest . --typescript --tailwind --eslint
   ```

2. **Setup Shadcn UI** ✅
   - Initialize Shadcn UI and install base components
   ```bash
   npx shadcn@latest init
   # Configure with default style, slate color, and CSS variables
   
   # Install core components
   npx shadcn@latest add button
   npx shadcn@latest add card
   npx shadcn@latest add checkbox
   npx shadcn@latest add select
   npx shadcn@latest add input
   npx shadcn@latest add tabs
   npx shadcn@latest add table
   npx shadcn@latest add calendar
   npx shadcn@latest add popover
   ```

3. **Create API Connector** ✅
   - Build a simple API connector module to communicate with the Python backend
   - Define interfaces for request/response data

## Phase 2: Basic UI Components ⚙️

1. **Create Main Page Structure** ✅
   - Implement app layout with header, main content area, and footer
   - Add basic styling and responsive design elements

2. **Implement Form Component** ✅
   - Build the configuration form that mirrors CLI options:
     - Ticker selection
     - Analyst selection
     - Date range selection
     - Initial cash setting
     - Model selection

3. **Build Results Display** ✅
   - Create table components to display trading decisions
   - Implement tabs for different result views (Portfolio Decisions, Analyst Signals)

4. **Add Static Mock Data** ✅
   - Create mock data structures that match expected API responses
   - Use these for initial UI development and testing

## Phase 3: Backend Integration - FastAPI

1. **Set Up FastAPI in Python Backend**
   - Install FastAPI and required dependencies
   ```bash
   poetry add fastapi uvicorn
   ```
   - Create `api.py` file in the `src` directory

2. **Create API Endpoints**
   - Implement endpoint for running hedge fund simulation
   - Add CORS handling for local development
   - Ensure all CLI parameters are available as API parameters

3. **Refactor Main.py**
   - Extract core logic from CLI interface
   - Create reusable functions that can be called from both CLI and API

4. **Implement API Server Launch Script**
   - Create script to start the FastAPI server
   - Add documentation for API usage

## Phase 4: UI-Backend Connection

1. **Update UI to Call Real API**
   - Replace mock data with actual API calls
   - Implement proper error handling and loading states

2. **Add Authentication (Optional)**
   - Implement basic authentication if needed
   - Secure API endpoints

3. **Implement Websocket for Long-Running Operations**
   - Add real-time updates for long-running simulations
   - Show progress indicators during calculations

## Phase 5: Enhanced Features

1. **Add Visualization Components**
   - Implement charts for portfolio performance
   - Add visualizations for historical data

2. **Implement Backtesting UI**
   - Create interface for backtesting functionality
   - Add visual comparison of strategies

3. **Add User Preferences**
   - Save user configuration options
   - Implement theme switching

## Phase 6: Deployment and Polish

1. **Set Up Deployment Pipeline**
   - Configure for deployment to hosting platform
   - Set up environment variables for production

2. **Performance Optimization**
   - Optimize API response times
   - Implement caching where appropriate

3. **Final Testing and Documentation**
   - Complete end-to-end testing
   - Update README with new UI instructions

## Implementation Checklist

As we progress through each phase, we'll check off completed items:

- [x] Phase 1: Project Setup and Foundation
- [ ] Phase 2: Basic UI Components (In Progress - 4/4 tasks completed)
- [ ] Phase 3: Backend Integration - FastAPI
- [ ] Phase 4: UI-Backend Connection
- [ ] Phase 5: Enhanced Features
- [ ] Phase 6: Deployment and Polish

## Next Steps

Our immediate next steps are:

1. Begin Phase 3: Backend Integration with FastAPI
2. Create the API endpoints in the Python backend
3. Refactor Main.py to support both CLI and API usage

This plan will be updated as we progress through the migration. 