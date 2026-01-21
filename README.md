# 🎵 IML Audio Workstation (AI Based Audio Visualizer)

**IML Audio Workstation**은 딥러닝(Deep Learning)을 활용하여 오디오를 분석하고, 이를 시네마틱한 그래픽으로 시각화하는 웹 기반 인터랙티브 툴입니다.

단순한 파형 시각화를 넘어, AI가 소리의 특징을 분석하여 3가지 유형(Jagged, Fluid, Granular)의 그래픽으로 변환합니다. 사용자는 결과가 마음에 들지 않을 경우 **타임라인에서 특정 구간을 선택해 수정**할 수 있으며, 이 수정 데이터를 바탕으로 **AI 모델을 즉시 재학습(Fine-tuning)**시켜 나만의 시각화 모델을 만들 수 있습니다.

---

## ✨ 주요 기능

### 1. 🔍 AI 오디오 분석 (Sound to Graphic)
- **입력:** 마이크 녹음 또는 오디오 파일 업로드 (.wav, .mp3, .webm 등 지원)
- **분석:** `Librosa`와 `PyTorch` 모델을 사용하여 오디오의 주파수 및 특징 추출
- **출력:**
  - **Glyph Type:** Jagged(날카로움), Fluid(부드러움), Granular(입자감) 중 하나로 분류
  - **Parameters:** Scale(크기), Opacity(투명도), Spikiness(변형도), Grain(밀도) 값 예측

### 2. 🎨 시네마틱 시각화 (Three.js)
- 영화 자막 바(Cinema Subtitle Bar) 비율인 **5:1 와이드 비율**의 흑백 그래픽.
- **Custom Shader(GLSL)**를 활용한 고품질 실시간 렌더링.
  - **Jagged:** 중심에서 뻗어나가는 날카로운 기하학적 형태.
  - **Fluid:** 부드럽게 일렁이는 액체 형태.
  - **Granular:** 바람에 날리는 모래알처럼 흩어지는 입자 효과.

### 3. ✂️ 인터랙티브 편집 (Human-in-the-loop)
- **Timeline UI:** 오디오 전체 파형을 보고 마우스로 드래그하여 특정 구간 선택.
- **Real-time Override:** 선택한 구간 내에서 슬라이더를 조작하면 시각화가 실시간으로 변경.
- **구간 반복 재생:** 편집 중인 구간을 무한 반복하여 디테일한 수정 가능.

### 4. 🧠 사용자 피드백 학습 (Fine-tuning)
- 사용자가 수정한 파라미터 값을 데이터셋에 누적.
- **'AI 모델 학습시키기'** 버튼 클릭 시, 서버에서 즉시 모델을 파인튜닝(Fine-tuning)하여 사용자 취향 반영.

---

## 🛠 설치 및 실행 방법

### 1. 사전 요구 사항 (Prerequisites)
이 프로젝트는 Python 3.8 이상이 필요하며, 오디오 처리를 위해 **FFmpeg**가 반드시 설치되어 있어야 합니다.

#### FFmpeg 설치
- **Mac (Homebrew):**
  ```bash
  brew install ffmpeg
