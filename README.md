<p align="center">
  <img src="gemini-gpt/public/Gemini_gpt_logo.png" alt="Gemini GPT Logo" width="120" />
</p>

# Gemini GPT

A modern, ChatGPT-like AI chat application built with Vite + React inspired by the well designed and loved ChatGPT UI but powered by the best AI in the world—Google Gemini.

## Features

- **Modern UI**: Dark mode interface similar to ChatGPT.
- **Latest Library**: Google GenAI SDK
- **Gemini Integration**: Supports `gemini-3-pro-preview`, `gemini-3-flash-preview`, and other models.
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
- Google GenAI SDK
- Lucide React (Icons)
- React Markdown
