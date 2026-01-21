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

window.onload = () => {
    initThreeJS();
    setupAudio();
    setupTimelineEvents();
    setupUIControls();
};

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

    // --- [Grain 로직을 모든 도형에 적용] ---
    const fragmentShader = `
        uniform float uTime;
        uniform float uGlyphType; 
        uniform float uScale;
        uniform float uOpacity;
        uniform float uSpikiness; 
        uniform float uGrain;     // 입자 밀도 (Density)
        varying vec2 vUv;

        // --- Noise Functions ---
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

            // --- 1. [공통 Grain 생성] ---
            // Jagged와 Fluid에 적용할 전역 노이즈 마스크
            // uGrain: 1.0 = 빽빽함(Solid), 0.0 = 듬성듬성(Sparse)
            float dotSize = 120.0; 
            // 약간의 지글거림을 위해 uTime 추가
            float staticNoise = random(floor(uv * dotSize) + uTime * 0.1); 
            float globalGrainMask = step(1.0 - uGrain, staticNoise);

            // --- 2. 도형 정의 ---

            // A. Jagged
            float spike = abs(sin(angle * 12.0 + uTime)); 
            spike = pow(spike, 4.0);
            float distJagged = r - (spike * 0.3);
            
            // B. Fluid
            float fluidNoise = snoise(pos * 3.0 + uTime * 0.8);
            float distFluid = r + fluidNoise * 0.15;

            // C. Granular (특수 로직)
            vec2 granularGrid = floor((uv + vec2(uTime * 0.1, 0.0)) * 100.0);
            float granularNoise = random(granularGrid);
            float falloff = mix(1.0, 0.01, uSpikiness);
            float distProb = 1.0 - smoothstep(baseSize, baseSize + falloff, r);
            float granularDensity = uGrain * 0.9 + 0.1;
            float granularDots = step(1.0 - (distProb * granularDensity), granularNoise);

            
            // --- 3. Mixing & Final Alpha ---
            float finalAlpha = 0.0;

            if(uGlyphType <= 1.0) {
                // [Jagged <-> Fluid]
                // 1. 도형의 형태(거리) 믹스
                float mixedDist = mix(distJagged, distFluid, uGlyphType);
                
                // 2. 아웃라인 처리 (Spikiness -> Blur)
                float edgeBlur = mix(0.4, 0.001, uSpikiness);
                // "Solid"한 형태의 알파값
                float solidShapeAlpha = 1.0 - smoothstep(baseSize - edgeBlur, baseSize + edgeBlur, mixedDist);
                
                // 3. [Grain 적용]
                // Solid 형태에 구멍을 뚫어서 입자처럼 보이게 함
                // uGrain이 1이면 globalGrainMask가 항상 1이 되어 solidShapeAlpha 유지
                // uGrain이 낮으면 구멍이 숭숭 뚫림
                finalAlpha = solidShapeAlpha * globalGrainMask;

            } else {
                // [Fluid <-> Granular]
                
                // Fluid 쪽도 Grain 적용 필요
                float fluidShapeAlpha = 1.0 - smoothstep(baseSize - 0.1, baseSize + 0.1, distFluid);
                float fluidWithGrain = fluidShapeAlpha * globalGrainMask;

                // 믹스
                finalAlpha = mix(fluidWithGrain, granularDots, uGlyphType - 1.0);
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
            uSpikiness: { value: 0.5 },
            uGrain: { value: 0.5 }
        },
        vertexShader: vertexShader, fragmentShader: fragmentShader, transparent: true
    });

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 1.0), material);
    plane.position.set(0, 0, 0);
    scene.add(plane);
    animate();
}

// --- 2. Main Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    if (material) material.uniforms.uTime.value += 0.01;

    if (audioEl && audioDuration > 0) {
        let currentTime = audioEl.currentTime;

        // Loop Logic
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
    material.uniforms.uSpikiness.value = params[2];
    material.uniforms.uGrain.value = params[3];
}

// --- 3. Interaction Logic ---

function applyOverrideToSelection() {
    if (!hasSelection || audioFrames.length === 0) {
        alert("선택된 구간이 없습니다.");
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
    const originalText = btn.innerText;
    btn.innerText = "✅ 적용 완료!";
    setTimeout(() => btn.innerText = originalText, 1000);
}

async function trainModel() {
    const btn = document.getElementById('btn-train');
    if (audioFrames.length === 0) return;
    btn.innerText = "⏳ 서버 학습 중...";
    btn.disabled = true;

    try {
        const res = await fetch('/train_finetune', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(audioFrames)
        });
        const data = await res.json();
        if (data.status === 'success') {
            alert("학습 완료! 모델이 업데이트되었습니다.");
            btn.innerText = "🧠 AI 모델 학습시키기";
        } else { throw new Error(data.msg); }
    } catch (err) {
        alert("학습 실패: " + err.message);
        btn.innerText = "⚠️ 재시도";
    } finally { btn.disabled = false; }
}

// --- 4. Timeline Logic ---
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

// --- 5. Helpers ---
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
    ['scale', 'opacity', 'spikiness', 'grain'].forEach((name, i) => {
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
    btn.innerText = "⏳ 분석 중...";
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
        btn.innerText = "✅ 완료";
    } catch (err) {
        alert(err.message);
        btn.disabled = false;
    }
}

let mediaRecorder, audioChunks = [];
async function toggleRecord() {
    const btn = document.getElementById('btn-record');
    if (btn.innerText.includes("녹음")) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        audioChunks = [];
        btn.innerText = "🛑 중지";
        btn.style.background = "#ff0000";
        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            prepareFile(new File([blob], "mic_rec.wav", { type: 'audio/wav' }));
            stream.getTracks().forEach(t => t.stop());
        };
    } else {
        mediaRecorder.stop();
        btn.innerText = "🎤 마이크 녹음";
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