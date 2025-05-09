# The AI Piano Performer - Generate beautiful piano music with AI using natural language prompts

![AI Piano Performer Screenshot](https://github.com/lesteroliver911/ai-piano-player/blob/main/ai_performer.jpg)

### Demo Video
Watch our demo video to see the AI Piano Performer in action:
<video src="aipiano-demo.mp4" controls width="800"></video>

## ✨ Overview

The AI Piano Performer is an interactive web application that generates piano music using AI based on natural language prompts. This project combines my passion for music with my knowledge of AI to create an accessible tool for music creation.

Simply describe the kind of music you want to hear, and watch as the AI creates a unique piano composition tailored to your request. No musical experience required!


## 🎹 Features

- **🤖 AI-Powered Music Generation**: Create original piano compositions using natural language prompts
- **🎵 Interactive Piano Visualization**: Watch as the virtual piano plays your generated music
- **💾 MIDI Export**: Download your compositions as MIDI files for use in other music software
- **🎛️ Playback Controls**: Adjust tempo and volume to perfect your listening experience
- **🎨 Responsive Design**: Works on desktop and mobile devices

## 🎵 Generated Samples

Check out some example compositions in our [generated samples folder](generated_samples/):


## ⚠️ Known Issues

Current limitations that are being addressed:

1. **Nursery Rhymes Quality**: While nursery rhymes are mostly on point, we're working to make performances sound more human-like. Current generations sound more like a beginner pianist.

2. **Generation Consistency**: Some generations can be random. So far, testing has only been done with OpenAI's API. Support for Claude and Gemini is planned.

3. **Limited Instruments**: Currently only one piano instrument is available. Support for additional instruments is in development.

4. **Download Formats**: Only MIDI download is available for now. MP3 and WAV downloads will be added soon.


## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/signup))

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/lesteroliver911/ai-piano-player.git
   cd ai-piano-player
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 📝 Usage

1. When you first open the app, you'll be prompted to enter your OpenAI API key
2. Type a prompt describing the music you want, for example:
   - "A melancholic piano piece inspired by rainfall"
   - "An upbeat jazz-influenced composition with walking bass"
   - "A gentle lullaby with a dreamy atmosphere"
3. Click "Generate" and wait for the AI to create your music
4. Use the playback controls to listen, adjust tempo, and download as MIDI

## 🔧 How It Works

The application uses:

- **React** and **TypeScript** for the frontend UI
- **OpenAI's GPT-4o** for generating musical compositions
- **Web Audio API** for real-time audio playback
- **Tone.js** for audio processing
- **MIDI.js** for MIDI file handling

The AI generates between 32-128 notes per composition, using proper musical phrasing with tension and resolution, clear melodic themes, and harmonically coherent progressions.


## 🛣️ Roadmap

This is just the start! Future enhancements include:

- [ ] Multiple instrument options
- [ ] Advanced music theory controls


## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📬 Contact

Lester Oliver - https://www.linkedin.com/in/lesteroliver/

Project Link: [https://github.com/lesteroliver911/ai-piano-player](https://github.com/lesteroliver911/ai-piano-player)

---

<div align="center">
  Made with ♪♫ and 🤖
</div>

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
