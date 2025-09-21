<div align="center">
<img width="1200" height="475" alt="Startup Analyzer Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Startup Analyzer MVP

**AI-Powered Startup Evaluation for Venture Capitalists**

Startup Analyzer is an intelligent platform that automates the evaluation of startup potential using advanced AI analysis. It helps venture capitalists make data-driven investment decisions by analyzing publicly available information about startups and generating comprehensive unicorn potential scores.

## How It Solves the Problem

Traditional startup evaluation is time-consuming, subjective, and often limited by human bias and information gaps. Startup Analyzer addresses these challenges by:

-   **Automating Research**: Uses AI to automatically gather and analyze publicly available data about startups, saving hours of manual research.
-   **Standardizing Evaluation**: Provides consistent, objective scoring criteria across all startup evaluations.
-   **Comprehensive Analysis**: Evaluates multiple critical dimensions (founders, market, technology, competitors) in a single assessment.
-   **Data-Driven Insights**: Leverages Google's powerful search capabilities and Gemini AI to process vast amounts of information.
-   **Speed**: Reduces evaluation time from days to minutes while maintaining analytical depth.

## Unique Selling Proposition (USP)

**The only AI-powered platform that combines real-time web intelligence with standardized unicorn prediction scoring.**

-   **Real-time Intelligence**: Unlike static databases, Startup Analyzer pulls the latest information from the web.
-   **AI-Native Approach**: Built from the ground up with AI at its core, not as an add-on feature.
-   **Standardized Scoring**: Proprietary algorithm that converts qualitative insights into quantitative unicorn probability scores.
-   **VC-Focused**: Specifically designed for venture capital workflows and decision-making processes.
-   **Instant Analysis**: Get comprehensive startup evaluation in minutes, not weeks.

## Features

### Core Functionality

-   **Smart Company Search**: Search by company name or website URL.
-   **AI-Powered Data Collection**: Automatically gathers information from multiple online sources.
-   **Multi-Dimensional Scoring**: Evaluates startups across 4 key dimensions:
    -   **Founder Analysis**: Team background, experience, and track record.
    -   **Market Analysis**: Market size, opportunity, and positioning.
    -   **Technical Analysis**: Product innovation, technology stack, and scalability.
    -   **Competitor Analysis**: Competitive landscape and differentiation.

### User Experience

-   **Interactive Dashboard**: Visual representation of scores with detailed breakdowns.
-   **Real-time Loading**: Live progress indicators during analysis.
-   **Responsive Design**: Works seamlessly across desktop and mobile devices.
-   **Error Handling**: Graceful handling of API failures and edge cases.

### Analytics & Tracking

-   **Google Analytics Integration**: Track usage patterns and user engagement.

## Roadmap: Upcoming Features

-   **In-Depth Document Analysis**: Soon, you'll be able to upload startup documents like pitch decks and business plans. The app will use advanced services like Google's Document AI to extract and analyze key information, providing an even deeper evaluation.
-   **Autonomous AI Agents**: We are working on implementing AI agents that will use tools like Google Search to perform more comprehensive, autonomous research on companies, markets, and competitors, delivering richer insights.

## Technologies Used

### Frontend

-   **React 19**: Latest version with improved performance and developer experience.
-   **TypeScript**: Type-safe development for better code quality and maintainability.
-   **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
-   **Recharts**: Interactive charts and data visualization library.
-   **Vite**: Fast build tool and development server.

### AI & Backend Services

-   **Google Gemini AI**: Advanced language model for content analysis and scoring.
-   **Google Search**: Real-time web data collection and information gathering via Gemini grounding.

### Development Tools

-   **Node.js**: Runtime environment.
-   **npm**: Package management.
-   **Google Analytics**: User behavior tracking and analytics.

## Architecture

-   **Single Page Application (SPA)**: Fast, responsive user experience.
-   **Component-Based Architecture**: Modular, maintainable React components.
-   **Type-Safe Development**: Full TypeScript implementation.
-   **API Integration**: Seamless integration with Google's AI and Search services.

## Run Locally

**Prerequisites:** Node.js

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set the `API_KEY` Environment Variable**

    This application requires a Google Gemini API key. The application code is configured to read this key from the `process.env.API_KEY` environment variable. How you set this may vary based on your operating system or development environment. One common method is to use a `.env` file in the project root.

    Create a file named `.env` and add the following line:
    ```
    API_KEY="YOUR_GEMINI_API_KEY"
    ```
    *Note: Ensure your development server or build tool (like Vite) is configured to load this `.env` file.*

3.  **Run the app:**
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) (or the port specified in your console) in your browser.

## Deployment

View the live app in [AI Studio](https://ai.studio/apps/drive/13Tnccxgqyei9YdynNchT4N2MOPOiHWQq)
