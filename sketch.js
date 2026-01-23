// --- Global State ---
let audioFrames = []; 
let audioEl;
let pendingFile = null;
let isPlaying = false;
let audioDuration = 0;
const FRAME_DURATION = 0.0232; 

// Timeline & Selection
let selectionStart = 0; 
let selectionEnd = 0;   
let isSelecting = false; 
let hasSelection = false; 

// Three.js
let scene, camera, renderer, material;
let overrideState = { glyph: 0, params: [0.5, 0.5, 0.5, 0.5] }; 

// --- Language Support ---
let currentLang = 'ko'; // 'ko' or 'en'
const translations = {
    ko: {
        title_step1: "1. 오디오 입력",
        title_step2: "2. 구간 선택",
        title_step3: "3. 구간 수정",
        title_step4: "4. 학습",
        btn_file: "📁 파일 찾기",
        btn_mic: "🎤 마이크 녹음",
        btn_stop: "🛑 중지",
        btn_analyze: "🚀 분석 시작",
        btn_analyzing: "⏳ 분석 중...",
        btn_complete: "✅ 완료",
        btn_clear: "해제",
        btn_apply: "✨ 적용 (Apply)",
        btn_apply_done: "✅ 적용 완료!",
        btn_train: "🧠 AI 모델 학습",
        btn_training: "⏳ 학습 중...",
        btn_retry: "⚠️ 재시도",
        guide_drag: "드래그하여 구간 선택",
        lbl_scale: "크기",
        lbl_opacity: "투명도",
        lbl_definition: "정밀도",
        lbl_density: "질감",
        desc_train: "수정 결과를 학습시켜 개인화합니다.",
        alert_no_selection: "선택된 구간이 없습니다.",
        alert_train_success: "학습 완료! 모델이 업데이트되었습니다.",
        alert_train_fail: "학습 실패: ",
        err_server: "서버 에러"
    },
    en: {
        title_step1: "1. Audio Input",
        title_step2: "2. Selection",
        title_step3: "3. Editing",
        title_step4: "4. Training",
        btn_file: "📁 Open File",
        btn_mic: "🎤 Record Mic",
        btn_stop: "🛑 Stop",
        btn_analyze: "🚀 Start Analysis",
        btn_analyzing: "⏳ Analyzing...",
        btn_complete: "✅ Done",
        btn_clear: "Clear",
        btn_apply: "✨ Apply",
        btn_apply_done: "✅ Applied!",
        btn_train: "🧠 Train AI Model",
        btn_training: "⏳ Training...",
        btn_retry: "⚠️ Retry",
        guide_drag: "Drag to select range",
        lbl_scale: "Scale",
        lbl_opacity: "Opacity",
        lbl_definition: "Definition",
        lbl_density: "Density",
        desc_train: "Train the model with your edits for personalization.",
        alert_no_selection: "No range selected.",
        alert_train_success: "Training complete! Model updated.",
        alert_train_fail: "Training failed: ",
        err_server: "Server Error"
    }
};

// --- Initialization ---
window.onload = () => {
    initThreeJS();
    setupAudio();
    setupTimelineEvents();
    setupUIControls();
    updateLanguageUI(); // 초기 언어 설정 적용
};

// --- Language Functions ---
function toggleLanguage() {
    currentLang = (currentLang === 'ko') ? 'en' : 'ko';
    updateLanguageUI();
}

function t(key) {
    return translations[currentLang][key] || key;
}

function updateLanguageUI() {
    const elements = document.querySelectorAll('[data-key]');
    elements.forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });
}

// --- Three.js & Shader Logic (기존과 동일) ---
function initThreeJS() {
    const container = document.getElementById('canvas-wrapper');
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const vertexShader = `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `;

    const fragmentShader = `
        uniform float uTime;
        uniform float uGlyphType; 
        uniform float uScale;
        uniform float uOpacity;
        uniform float uDefinition; 
        uniform float uDensity;     
        varying vec2 vUv;

        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        float snoise(vec2 v){
            const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                    -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
            vec2 uv = vUv;
            uv.x *= 5.0; 
            vec2 center = vec2(2.5, 0.5);
            vec2 pos = uv - center;
            float r = length(pos);
            float angle = atan(pos.y, pos.x);

            float baseSize = uScale * 0.8;
            float dotSize = 120.0; 
            float staticNoise = random(floor(uv * dotSize) + uTime * 0.1); 
            float globalDensityMask = step(1.0 - uDensity, staticNoise);

            // A. Jagged
            float spike = abs(sin(angle * 12.0 + uTime)); 
            spike = pow(spike, 4.0);
            float distJagged = r - (spike * 0.3);
            
            // B. Fluid
            float fluidNoise = snoise(pos * 3.0 + uTime * 0.8);
            float distFluid = r + fluidNoise * 0.15;

            // C. Granular
            vec2 granularGrid = floor((uv + vec2(uTime * 0.1, 0.0)) * 100.0);
            float granularNoise = random(granularGrid);
            float falloff = mix(1.0, 0.01, uDefinition);
            float distProb = 1.0 - smoothstep(baseSize, baseSize + falloff, r);
            float granularDensity = uDensity * 0.9 + 0.1;
            float granularDots = step(1.0 - (distProb * granularDensity), granularNoise);

            float finalAlpha = 0.0;
            if(uGlyphType <= 1.0) {
                float mixedDist = mix(distJagged, distFluid, uGlyphType);
                float edgeBlur = mix(0.4, 0.001, uDefinition);
                float solidShapeAlpha = 1.0 - smoothstep(baseSize - edgeBlur, baseSize + edgeBlur, mixedDist);
                finalAlpha = solidShapeAlpha * globalDensityMask;
            } else {
                float fluidShapeAlpha = 1.0 - smoothstep(baseSize - 0.1, baseSize + 0.1, distFluid);
                float fluidWithDensity = fluidShapeAlpha * globalDensityMask;
                finalAlpha = mix(fluidWithDensity, granularDots, uGlyphType - 1.0);
            }
            gl_FragColor = vec4(1.0, 1.0, 1.0, finalAlpha * uOpacity);
        }
    `;

    material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uGlyphType: { value: 0 },
            uScale: { value: 0.5 }, 
            uOpacity: { value: 0.5 }, 
            uDefinition: { value: 0.5 },
            uDensity: { value: 0.5 }
        },
        vertexShader: vertexShader, fragmentShader: fragmentShader, transparent: true
    });

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 1.0), material);
    plane.position.set(0, 0, 0);
    scene.add(plane);
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    if (material) material.uniforms.uTime.value += 0.01;

    if (audioEl && audioDuration > 0) {
        let currentTime = audioEl.currentTime;

        if (hasSelection && isPlaying) {
            if (currentTime < selectionStart || currentTime > selectionEnd) {
                audioEl.currentTime = selectionStart; 
                currentTime = selectionStart;
            }
        }
        updatePlayheadUI(currentTime);
        let isInsideSelection = hasSelection && (currentTime >= selectionStart && currentTime <= selectionEnd);
        
        if (isInsideSelection) {
            applyUniforms(overrideState.glyph, overrideState.params);
        } else {
            const frameIdx = Math.floor(currentTime / FRAME_DURATION);
            if (frameIdx < audioFrames.length) {
                const frame = audioFrames[frameIdx];
                applyUniforms(frame.glyph, frame.params);
            }
        }
    }
    renderer.render(scene, camera);
}

function applyUniforms(glyph, params) {
    if(!material) return;
    material.uniforms.uGlyphType.value = glyph;
    material.uniforms.uScale.value = params[0];
    material.uniforms.uOpacity.value = params[1];
    material.uniforms.uDefinition.value = params[2];
    material.uniforms.uDensity.value = params[3];
}

// --- Interaction Logic ---
function applyOverrideToSelection() {
    if (!hasSelection || audioFrames.length === 0) {
        alert(t("alert_no_selection"));
        return;
    }
    const startIdx = Math.floor(selectionStart / FRAME_DURATION);
    const endIdx = Math.floor(selectionEnd / FRAME_DURATION);

    for (let i = startIdx; i <= endIdx; i++) {
        if (i >= 0 && i < audioFrames.length) {
            audioFrames[i].glyph = overrideState.glyph;
            audioFrames[i].params = [...overrideState.params]; 
        }
    }
    const btn = document.querySelector('#edit-panel button[onclick="applyOverrideToSelection()"]');
    const originalText = t("btn_apply");
    btn.innerText = t("btn_apply_done");
    setTimeout(() => btn.innerText = originalText, 1000);
}

async function trainModel() {
    const btn = document.getElementById('btn-train');
    if (audioFrames.length === 0) return;
    btn.innerText = t("btn_training");
    btn.disabled = true;

    try {
        const res = await fetch('/train_finetune', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(audioFrames)
        });
        const data = await res.json();
        if (data.status === 'success') {
            alert(t("alert_train_success"));
            btn.innerText = t("btn_train");
        } else { throw new Error(data.msg); }
    } catch (err) {
        alert(t("alert_train_fail") + err.message);
        btn.innerText = t("btn_retry");
    } finally { btn.disabled = false; }
}

// --- Timeline Logic ---
function setupTimelineEvents() {
    const timelineBar = document.getElementById('timeline-bar');
    const selectionBox = document.getElementById('selection-box');

    timelineBar.addEventListener('mousedown', (e) => {
        if (!audioDuration) return;
        isSelecting = true;
        const rect = timelineBar.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        selectionStart = ratio * audioDuration;
        selectionEnd = selectionStart;
        hasSelection = true;
        selectionBox.style.display = 'block';
        selectionBox.style.left = (ratio * 100) + '%';
        selectionBox.style.width = '0%';
        audioEl.currentTime = selectionStart; 
        audioEl.pause(); 
    });

    window.addEventListener('mousemove', (e) => {
        if (!isSelecting || !audioDuration) return;
        const rect = timelineBar.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const currentPos = ratio * audioDuration;
        const start = Math.min(selectionStart, currentPos);
        const end = Math.max(selectionStart, currentPos);
        selectionBox.style.left = ((start / audioDuration) * 100) + '%';
        selectionBox.style.width = (((end - start) / audioDuration) * 100) + '%';
        selectionEnd = currentPos;
    });

    window.addEventListener('mouseup', () => {
        if (isSelecting) {
            isSelecting = false;
            const s = Math.min(selectionStart, selectionEnd);
            const e = Math.max(selectionStart, selectionEnd);
            selectionStart = s;
            selectionEnd = e;
            if (selectionEnd - selectionStart < 0.1) clearSelection();
            else {
                audioEl.currentTime = selectionStart;
                audioEl.play(); 
            }
        }
    });
}

function clearSelection() {
    hasSelection = false;
    document.getElementById('selection-box').style.display = 'none';
    selectionStart = 0;
    selectionEnd = 0;
}

function updatePlayheadUI(currentTime) {
    if (!audioDuration) return;
    const percent = (currentTime / audioDuration) * 100;
    const playhead = document.getElementById('playhead');
    if(playhead) playhead.style.left = percent + '%';
}

// --- Helpers ---
function setupAudio() {
    audioEl = document.getElementById('audio-player');
    audioEl.onloadedmetadata = () => { audioDuration = audioEl.duration; };
    audioEl.onplay = () => { isPlaying = true; };
    audioEl.onpause = () => { isPlaying = false; };
    audioEl.onended = () => { isPlaying = false; };
}

function setupUIControls() {
    document.getElementById('file-input').addEventListener('change', (e) => {
        if(e.target.files[0]) prepareFile(e.target.files[0]);
    });
    ['scale', 'opacity', 'definition', 'density'].forEach((name, i) => {
        const slider = document.getElementById(`sl-${name}`);
        slider.addEventListener('input', (e) => {
            overrideState.params[i] = parseFloat(e.target.value);
        });
    });
}

function prepareFile(file) {
    pendingFile = file;
    document.getElementById('file-name').innerText = file.name;
    document.getElementById('confirm-area').classList.remove('hidden');
}

async function startAnalysis() {
    if(!pendingFile) return;
    const btn = document.getElementById('btn-confirm');
    btn.innerText = t("btn_analyzing");
    btn.disabled = true;
    const formData = new FormData();
    formData.append('file', pendingFile);

    try {
        const res = await fetch('/upload_analyze', { method: 'POST', body: formData });
        if (!res.ok) throw new Error("Server Error");
        const data = await res.json();
        audioFrames = data.frames;
        
        document.getElementById('player-area').classList.remove('hidden');
        document.getElementById('edit-panel').classList.remove('hidden');
        document.getElementById('train-panel').classList.remove('hidden');
        
        audioEl.src = URL.createObjectURL(pendingFile);
        btn.innerText = t("btn_complete");
    } catch (err) {
        alert(err.message);
        btn.disabled = false;
    }
}

let mediaRecorder, audioChunks = [];
async function toggleRecord() {
    const btn = document.getElementById('btn-record');
    // 텍스트 비교 대신 현재 클래스나 상태 변수를 쓰는 것이 좋지만, 
    // 여기서는 간단히 btn-record의 배경색 등으로 토글 상태 확인
    const isRecording = btn.style.background.includes('rgb(255, 0, 0)'); // #ff0000

    if (!isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        audioChunks = [];
        btn.innerText = t("btn_stop");
        btn.style.background = "#ff0000";
        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            prepareFile(new File([blob], "mic_rec.wav", { type: 'audio/wav' }));
            stream.getTracks().forEach(t => t.stop());
        };
    } else {
        mediaRecorder.stop();
        btn.innerText = t("btn_mic");
        btn.style.background = "#ff4444";
    }
}

window.setOverrideShape = function(type) {
    overrideState.glyph = type;
    document.querySelectorAll('.shape-btn').forEach((b, i) => {
        b.style.background = (i === type) ? '#00ffcc' : '#333';
        b.style.color = (i === type) ? '#000' : '#fff';
    });
};

window.addEventListener('resize', () => {
    const container = document.getElementById('canvas-wrapper');
    if(camera && renderer) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
});