# MedPayRez Provider Portal

## Local Development with Netlify Functions

To run the application locally with full AI functionality:

1.  **Set Environment Variables**:
    Create a `.env` file (if not present) or set in your shell:
    ```bash
    export OPENROUTER_API_KEY=your_key_here
    export VITE_ENABLE_AI_INSIGHTS=true
    ```

2.  **Start the Dev Server**:
    Use the Netlify Dev command to proxy functions and the frontend together.
    ```bash
    npm run dev:netlify
    ```
    This will start the server, typically at `http://localhost:8888`.

3.  **Function Endpoint**:
    The AI generation function is available at:
    `http://localhost:8888/.netlify/functions/generate-insight`

## Deployment

Build the application:
```bash
npm run build
```

This will compile the TypeScript and Vite assets to `dist/` and prepare functions in `netlify/functions/`.
