# Gemini Chat App

A modern, ChatGPT-like AI chat application built with Vite + React and powered by the Google Gemini API.

## Features

- **Modern UI**: Dark mode interface similar to ChatGPT.
- **Gemini Integration**: Supports `gemini-1.5-pro`, `gemini-1.5-flash`, and other models.
- **Streaming Responses**: Real-time text generation.
- **Multi-modal Support**: Upload images and PDFs for analysis.
- **Grounding**: Google Search grounding enabled.
- **Persistence**: Chat history is saved to Local Storage.

## Setup & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API Key**
   You need a Google Gemini API Key to run this application.
   
   - The user has created a `.env.local` file for local development. 
   - Ensure your `.env.local` file contains:
     ```env
     VITE_GEMINI_API_KEY=your_api_key_here
     ```
   
   Alternatively, you can copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Start the App**
   ```bash
   npm run dev
   ```

## Technologies
- Vite + React
- Tailwind CSS
- Google Generative AI SDK
- Lucide React (Icons)
- React Markdown
