# 🎵 Beyond Parentheses
**Personalizing Graphical Sound Captions through Interactive Machine Learning.** 
<br>
**AI 기반 인터랙티브 오디오 시각화 및 파인튜닝 워크스테이션**

---

<details>
<summary><strong>🇺🇸 English Description (Click to Expand)</strong></summary>
<br>

## 📖 Introduction
**IML Audio Workstation** is a web-based interactive tool that uses Deep Learning to analyze audio and visualize it into cinematic graphics.

Going beyond simple waveform visualization, the AI analyzes sound characteristics and translates them into three graphic styles: **Jagged, Fluid, and Granular**. If the AI's interpretation doesn't match your intent, you can **select a specific timeline segment to edit** parameters. The system then **fine-tunes the model** based on your edits, effectively learning your visual preferences.

## ✨ Key Features

### 1. 🔍 AI Audio Analysis
- **Input:** Microphone recording or file upload (.wav, .mp3, .webm).
- **Analysis:** Feature extraction using `Librosa` and inference via `PyTorch`.
- **Output:**
  - **Glyph Type:** Jagged (Sharp), Fluid (Soft), Granular (Particle).
  - **Parameters:** Scale, Opacity, Spikiness, Grain.

### 2. 🎨 Cinematic Visualization (Three.js)
- Rendered in a **5:1 wide aspect ratio** (Cinema Subtitle Bar style).
- **Custom GLSL Shaders** for high-quality real-time rendering.
  - **Jagged:** Geometric shapes radiating from the center.
  - **Fluid:** Smooth, liquid-like blobs.
  - **Granular:** Particle effects drifting like sand.

### 3. ✂️ Interactive Editing (Human-in-the-loop)
- **Timeline UI:** Drag to select segments of the audio waveform.
- **Real-time Override:** Adjust sliders to see immediate visual changes.
- **Loop Playback:** Seamless looping for precise editing.

### 4. 🧠 User Feedback Training
- Clicking **'Train AI Model'** fine-tunes the server-side model (`DualHeadNet`) with your custom adjustments.
- Uses **Active Learning** to adapt to user preferences over time.

## 🛠 Installation & Usage

### 1. Prerequisites
- **Python 3.8+**
- **FFmpeg** (Required for audio processing)
  - *Mac:* `brew install ffmpeg`
  - *Windows:* Download from [ffmpeg.org](https://ffmpeg.org) and add to PATH.

### 2. Setup

# 1. Clone the repository
git clone [https://github.com/your-username/IML-Audio-Workstation.git](https://github.com/your-username/IML-Audio-Workstation.git)
cd IML-Audio-Workstation

# 2. Create virtual environment (Optional but recommended)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt
3. Run
Bash

python app.py
Access the interface at: http://localhost:5001

📂 Project Structure
IML-Audio-Workstation/
├── app.py               # Flask Server & Main Logic
├── model.py             # PyTorch DualHeadNet Model
├── best_model.pth       # Pre-trained Model Weights
├── static/
│   ├── index.html       # Frontend UI
│   ├── sketch.js        # Three.js Visualization Logic
│   └── style.css        # Styling
├── uploads/             # Audio storage
└── data/                # Training data storage
💻 Tech Stack
Backend: Python, Flask, PyTorch, Librosa

Frontend: HTML5, CSS3, JavaScript, Three.js (GLSL)
</details>

<summary><strong> </strong></summary>
<br>

📖 소개
<br>
딥러닝(Deep Learning)을 활용하여 오디오를 분석하고, 이를 시네마틱한 그래픽으로 시각화하는 웹 기반 인터랙티브 툴입니다.

단순한 파형 시각화를 넘어, AI가 소리의 특징을 분석하여 3가지 유형(Jagged, Fluid, Granular)의 그래픽으로 변환합니다. 사용자는 결과가 마음에 들지 않을 경우 타임라인에서 특정 구간을 선택해 수정할 수 있으며, 이 수정 데이터를 바탕으로 AI 모델을 재학습(Fine-tuning)시켜 나만의 시각화 모델을 만들 수 있습니다.

✨ 주요 기능
1. 🔍 AI 오디오 분석
입력: 마이크 녹음 또는 오디오 파일 업로드 (.wav, .mp3 등).

분석: Librosa와 PyTorch 모델을 사용하여 오디오 특징 추출.

출력:

도형 타입: Jagged(날카로움), Fluid(부드러움), Granular(입자감).

파라미터: 크기(Scale), 투명도(Opacity), 변형도(Spikiness), 밀도(Grain).

2. 🎨 시네마틱 시각화 (Three.js)
영화 자막 바 비율인 5:1( < 이 부분 수정예정 )와이드 비율의 그래픽.

Jagged: 중심에서 뻗어나가는 기하학적 형태.

Fluid: 부드럽게 일렁이는 액체 형태.

Granular: 바람에 날리는 모래알처럼 흩어지는 입자 효과.

3. ✂️ 인터랙티브 편집 (Human-in-the-loop)
Timeline UI: 오디오 전체 파형을 보고 마우스로 드래그하여 구간 선택.

Real-time Override: 선택 구간의 슬라이더를 조절하여 즉시 수정.

구간 반복: 편집 중인 구간을 무한 반복 재생.

4. 🧠 사용자 피드백 학습
'AI 모델 학습시키기' 버튼 클릭 시, 사용자가 수정한 데이터를 바탕으로 모델을 파인튜닝(Fine-tuning) 합니다.

사용하면 할수록 내 취향에 맞는 시각화 결과를 보여주는 능동 학습 시스템입니다.

🛠 설치 및 실행 방법
1. 사전 요구 사항
Python 3.8 이상

FFmpeg (오디오 처리를 위해 필수)

Mac: brew install ffmpeg

Windows: ffmpeg.org에서 다운로드 후 환경변수 설정.

2. 설치
Bash

# 1. 레포지토리 클론
git clone [https://github.com/사용자명/IML-Audio-Workstation.git](https://github.com/사용자명/IML-Audio-Workstation.git)
cd IML-Audio-Workstation

# 2. 가상환경 생성 (권장)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. 의존성 패키지 설치
pip install -r requirements.txt
3. 실행
Bash

python app.py
서버 실행 후 브라우저에서 접속: http://localhost:5001


💻 기술 스택
Backend: Python, Flask, PyTorch, Librosa

Frontend: HTML5, CSS3, JavaScript, Three.js (GLSL Shaders)

</details>
