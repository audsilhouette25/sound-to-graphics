import os
import json
import torch
import numpy as np
import librosa
import soundfile as sf
from flask import Flask, render_template, request, jsonify
from model import DualHeadNet
import torch.optim as optim
import torch.nn as nn

app = Flask(__name__, static_url_path='', static_folder='static', template_folder='static')

# --- 설정 및 초기화 ---
UPLOAD_FOLDER = 'uploads'
DATA_FILE = 'data/training_data.json'
MODEL_FILE = 'best_model.pth'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('data', exist_ok=True)

# 모델 로드 (CPU/GPU 자동 설정)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = DualHeadNet().to(device)

def load_model():
    if os.path.exists(MODEL_FILE):
        try:
            model.load_state_dict(torch.load(MODEL_FILE, map_location=device))
            print("✅ 학습된 모델 로드 완료")
        except:
            print("⚠️ 모델 파일 로드 중 에러 발생 (초기화 상태로 시작)")
    
    model.eval() 
    print("🔒 모델이 평가 모드(Eval)로 설정되었습니다.")

load_model()

# --- 라우트 ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload_analyze', methods=['POST'])
def upload_analyze():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        filepath = os.path.join(UPLOAD_FOLDER, 'current.wav')
        file.save(filepath)
        
        # 1. 전체 오디오 로드 (ffmpeg 설치됨 가정)
        try:
            y, sr = librosa.load(filepath, sr=22050)
        except Exception as e:
            print(f"Librosa load failed, trying audioread: {e}")
            # soundfile fallback
            data, samplerate = sf.read(filepath)
            if len(data.shape) > 1: data = np.mean(data, axis=1)
            if samplerate != 22050:
                y = librosa.resample(data, orig_sr=samplerate, target_sr=22050)
            else:
                y = data
            sr = 22050

        hop_length = 512
        
        # 2. 특징 추출 (Mel Spectrogram)
        mels = librosa.feature.melspectrogram(y=y, sr=sr, n_fft=2048, hop_length=hop_length, n_mels=128)
        mels_db = librosa.power_to_db(mels, ref=np.max)
        
        # 3. 프레임별 특징 벡터 생성 및 추론
        frames_data = []
        total_frames = mels_db.shape[1]
        
        model.eval()
        
        with torch.no_grad():
            for i in range(total_frames):
                col = mels_db[:, i]
                
                # [핵심 수정] numpy.float32 -> python float 강제 형변환
                # JSON 에러를 방지하기 위해 float()로 감싸줍니다.
                f1 = float(np.mean(col[:32]))
                f2 = float(np.mean(col[32:64]))
                f3 = float(np.mean(col[64:96]))
                f4 = float(np.mean(col[96:]))
                
                # Normalize
                feat = [(x + 80) / 80 for x in [f1, f2, f3, f4]]
                
                input_tensor = torch.FloatTensor([feat]).to(device)
                
                # 모델 예측
                glyph_prob, params = model(input_tensor)
                
                glyph_idx = int(torch.argmax(glyph_prob, dim=1).item())
                param_vals = params.cpu().numpy()[0].tolist() # 이건 이미 list(float)라 괜찮음
                
                frames_data.append({
                    'input': feat,
                    'glyph': glyph_idx,
                    'params': param_vals
                })

        print(f"✅ 분석 완료: {len(frames_data)} 프레임")
        return jsonify({'frames': frames_data})

    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/train_finetune', methods=['POST'])
def train_finetune():
    try:
        new_data = request.json
        if not new_data: return jsonify({'msg': 'No data'})

        # 1. 데이터 저장
        existing_data = []
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r') as f:
                try: existing_data = json.load(f)
                except: pass
        
        valid_data = [d for d in new_data if 'input' in d]
        
        formatted_data = []
        for d in valid_data:
            formatted_data.append({
                'input': d['input'],
                'label_glyph': d['glyph'],
                'label_params': d['params']
            })
            
        existing_data.extend(formatted_data)
        if len(existing_data) > 10000: existing_data = existing_data[-10000:]
            
        with open(DATA_FILE, 'w') as f:
            json.dump(existing_data, f)

        # 2. 학습 (Fine-tuning)
        print(f"🔄 {len(formatted_data)}개 프레임 학습 시작...")
        
        inputs = torch.FloatTensor([d['input'] for d in formatted_data]).to(device)
        labels_g = torch.LongTensor([d['label_glyph'] for d in formatted_data]).to(device)
        labels_p = torch.FloatTensor([d['label_params'] for d in formatted_data]).to(device)
        
        model.train()
        optimizer = optim.Adam(model.parameters(), lr=0.005)
        crit_cls = nn.CrossEntropyLoss()
        crit_reg = nn.MSELoss()
        
        for epoch in range(20):
            optimizer.zero_grad()
            out_g, out_p = model(inputs)
            loss = crit_cls(out_g, labels_g) + crit_reg(out_p, labels_p)
            loss.backward()
            optimizer.step()
            
        torch.save(model.state_dict(), MODEL_FILE)
        model.eval() # 다시 평가 모드로
        print("✅ 모델 업데이트 완료")

        return jsonify({'status': 'success'})
        
    except Exception as e:
        print(f"❌ 학습 중 에러: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # 포트를 5001로 유지 (맥북 AirPlay 수신기와 5000포트 충돌 방지용)
    app.run(port=5001, debug=True)