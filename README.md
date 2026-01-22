# 🎵 Beyond Parentheses : <br>IML Audio Workstation
**Personalizing Graphical Sound Captions through Interactive Machine Learning** 

<details>
<summary><strong>Description (Click to Expand)</strong></summary>
<br>

## Introduction
**IML Audio Workstation** is a web-based interactive tool that uses Deep Learning to analyze audio and visualize it into cinematic graphics.

Going beyond simple waveform visualization, the AI analyzes sound characteristics and translates them into three graphic styles: **Jagged, Fluid, and Granular**. If the AI's interpretation doesn't match your intent, you can **select a specific timeline segment to edit** parameters. The system then **fine-tunes the model** based on your edits, effectively learning your visual preferences.

## Key Features

### 1. AI Audio Analysis
- **Input:** Microphone recording or file upload (.wav, .mp3, .webm).
- **Analysis:** Feature extraction using `Librosa` and inference via `PyTorch`.
- **Output:**
  - **Glyph Type:** Jagged (Sharp), Fluid (Soft), Granular (Particle).
  - **Parameters:** Scale, Opacity, Spikiness, Grain.

### 2. Cinematic Visualization 
- Rendered in a Cinema Subtitle Bar style.
- **Custom GLSL Shaders** for high-quality real-time rendering.
  - **Jagged:** Geometric shapes radiating from the center.
  - **Fluid:** Smooth, liquid-like blobs.
  - **Granular:** Particle effects drifting like sand.

### 3. Interactive Editing 
- **Timeline UI:** Drag to select segments of the audio waveform.
- **Real-time Override:** Adjust sliders to see immediate visual changes.
- **Loop Playback:** Seamless looping for precise editing.

### 4. User Feedback Training
- Clicking **'Train AI Model'** fine-tunes the server-side model (`DualHeadNet`) with your custom adjustments.
- Uses **Active Learning** to adapt to user preferences over time.

# Installation & Usage

## 1. Prerequisites
- **Python 3.8+**
- **FFmpeg** (Required for audio processing)
  - *Mac:* `brew install ffmpeg`
  - *Windows:* Download from [ffmpeg.org](https://ffmpeg.org) and add to PATH.

## 2. Setup

### 1. Clone the repository
`git clone [https://github.com/audsilhouette25/IML-Audio-Workstation.git]`
<br>
`(https://github.com/audsilhouette25/IML-Audio-Workstation.git)`
<br>
`cd IML-Audio-Workstation`

### 2. Create virtual environment 

`python -m venv venv`
<br>
`source venv/bin/activate`
<br>
(Windows: `venv\Scripts\activate`)

### 3. Install dependencies
`pip install -r requirements.txt`

`python app.py`

Access the interface at: http://localhost:5001


💻 Tech Stack
Backend: Python, Flask, PyTorch, Librosa

Frontend: HTML5, CSS3, JavaScript, Three.js (GLSL)
</details>



