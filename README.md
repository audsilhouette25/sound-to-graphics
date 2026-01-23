# 🎵 Beyond Parentheses : IML Audio Workstation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

**Personalizing Graphical Sound Captions through Interactive Machine Learning**

> **Note to Reviewers:** This repository contains the source code and implementation details for the Extended Abstract submitted to the **CHI 2026 Student Research Competition**.

---

<summary><h2>📖 About the Research</h2></summary>

While speech captions are well-established, non-verbal sound captions (e.g., *"[suspenseful music]"*) often fail to convey the intuitive "texture" and temporal dynamics of audio. 

**"Beyond Parentheses"** proposes a parametric visual modality that translates auditory features into dynamic motion graphics. We utilize an **Interactive Machine Learning (IML)** approach, allowing users to correct the AI's interpretation and fine-tune the visualization model to match their subjective perception.

### 📄 Citation
If you find this work useful, please cite our CHI 2026 Extended Abstract:

```bibtex
@inproceedings{yang2026beyond,
  title={Beyond Parentheses: Personalizing Graphical Sound Captions through Interactive Machine Learning},
  author={Yang, Jiwon and Lee, Hwain},
  booktitle={CHI '26 Extended Abstracts: CHI Conference on Human Factors in Computing Systems Extended Abstracts},
  year={2026},
  publisher={ACM},
  address={New York, NY, USA}
}

# 🎵 Beyond Parentheses : IML Audio Workstation

[![CHI 2026](https://img.shields.io/badge/CHI_2026-Student_Research_Competition-blue?style=for-the-badge)](https://chi2026.acm.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

**Personalizing Graphical Sound Captions through Interactive Machine Learning**

> **Note to Reviewers:** This repository contains the source code and implementation details for the Extended Abstract submitted to the **CHI 2026 Student Research Competition**.

---

![System Overview](https://via.placeholder.com/800x400?text=Place+Your+System+Architecture+Diagram+Here)

<details open>
<summary><h2>📖 About the Research</h2></summary>

While speech captions are well-established, non-verbal sound captions (e.g., *"[suspenseful music]"*) often fail to convey the intuitive "texture" and temporal dynamics of audio. 

**"Beyond Parentheses"** proposes a parametric visual modality that translates auditory features into dynamic motion graphics. We utilize an **Interactive Machine Learning (IML)** approach, allowing users to correct the AI's interpretation and fine-tune the visualization model to match their subjective perception.

### 📄 Citation
If you find this work useful, please cite our CHI 2026 Extended Abstract:

```bibtex
@inproceedings{yang2026beyond,
  title={Beyond Parentheses: Personalizing Graphical Sound Captions through Interactive Machine Learning},
  author={Yang, Jiwon and Lee, Hwain},
  booktitle={CHI '26 Extended Abstracts: CHI Conference on Human Factors in Computing Systems Extended Abstracts},
  year={2026},
  publisher={ACM},
  address={New York, NY, USA}
}

```

</details>

<details>
<summary><h2>🚀 System Features (Click to Expand)</h2></summary>




### 1. AI Audio Analysis

* **Input:** Microphone recording or file upload (`.wav`, `.mp3`, `.webm`).
* **Analysis:** Feature extraction using `Librosa` (RMS, Spectral Centroid/Flatness/Rolloff) and inference via `PyTorch`.
* **Output:**
* **Glyph Type:** Jagged (Sharp/High Arousal), Fluid (Soft/Low Arousal), Granular (Noise/Roughness).
* **Parameters:** Scale, Opacity, Spikiness, Grain Density.



### 2. Cinematic Visualization (WebGL)

* Rendered in a responsive Cinema Subtitle Bar style.
* **Custom GLSL Shaders** for high-quality real-time rendering.
* **Jagged:** Geometric shapes radiating from the center.
* **Fluid:** Smooth, liquid-like metaballs.
* **Granular:** Particle systems drifting like visual noise.



### 3. Interactive Editing & Loop

* **Timeline UI:** Drag-and-drop selection of audio waveforms.
* **Real-time Override:** Adjust sliders to immediately modify visual parameters.
* **Seamless Loop:** Visuals loop perfectly for precise editing.

### 4. On-Demand Fine-Tuning (IML)

* **Active Learning Loop:** When the user clicks **'Train AI Model'**, the system:
1. Captures the user's manual adjustments as "Ground Truth".
2. Fine-tunes the server-side `DualHeadNet` model.
3. Updates future predictions to align with the user's personal preferences.



</details>

## 🛠️ Installation & Usage

### 1. Prerequisites

* **Python 3.8+**
* **FFmpeg** (Required for audio processing)
* *Mac:* `brew install ffmpeg`
* *Windows:* Download from [ffmpeg.org](https://ffmpeg.org) and add to PATH.



### 2. Setup Guide

#### Step 1. Clone the repository

```bash
git clone [https://github.com/audsilhouette25/IML-Audio-Workstation.git](https://github.com/audsilhouette25/IML-Audio-Workstation.git)
cd IML-Audio-Workstation

```

#### Step 2. Create virtual environment

```bash
# Mac / Linux
python -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate

```

#### Step 3. Install dependencies

```bash
pip install -r requirements.txt

```

#### Step 4. Run the application

```bash
python app.py

```

> Access the interface at: **http://localhost:5001**

## 💻 Tech Stack

* **Backend:** Python, Flask, PyTorch (Deep Learning), Librosa (Audio Analysis)
* **Frontend:** HTML5, CSS3, JavaScript, Three.js (GLSL Shaders for Visuals)

---

*This project was developed for the CHI 2026 Student Research Competition.*

```

```
