# The AI Piano Performer

A cool fun project that brought me to use my passion for music and my knowledge of AI.

## About

The AI Piano Performer is an interactive web application that generates piano music using AI based on natural language prompts. Simply describe the kind of music you want to hear, and watch as the AI creates a unique piano composition tailored to your request.

## Features

- **AI-Powered Music Generation**: Create original piano compositions using natural language prompts
- **Interactive Piano Visualization**: Watch as the virtual piano plays your generated music
- **MIDI Export**: Download your compositions as MIDI files for use in other music software
- **Playback Controls**: Adjust tempo and volume to perfect your listening experience

## How It Works

1. Enter your OpenAI API key
2. Type a prompt describing the music you want (e.g., "A melancholic piano piece inspired by rainfall")
3. Listen to your AI-generated composition
4. Download as MIDI if you want to save or further develop the piece

## Technology

This project uses:
- React with TypeScript for the frontend
- OpenAI's GPT models for music generation
- Web Audio API for playback
- Tone.js and MIDI.js for audio processing

## Future Development

This is just the start! I'll keep researching and adding more features to this repository, such as:
- More instrument options
- Multi-track compositions
- Advanced music theory controls
- Style transfer capabilities

## Feedback

Your connection and feedback are welcome! Feel free to open issues or contribute to the project.

---

Made with ♪♫ and 🤖

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
