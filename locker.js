// ==========================================
// STATE & STORAGE
// ==========================================

const STORAGE_KEY = 'secure_locker_data';

let appState = {
  isSetup: {
    pattern: false,
    face: false,
    voice: false
  },
  credentials: {
    pattern: null, // array of node indices
    face: null,    // base64 image data
    voice: null    // string phrase
  },
  documents: [] // Array of { id, name, type, data, timestamp }
};

// Load state from localStorage
function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Merge with default state
      appState = { ...appState, ...parsed };

      // Ensure documents array exists
      if (!appState.documents) appState.documents = [];
    } catch (e) {
      console.error('Failed to load state', e);
    }
  }
}

// Save state to localStorage
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

// Reset Security (Debug)
document.getElementById('resetAppBtn').addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all security credentials? This will not delete your documents.')) {
    appState.isSetup = { pattern: false, face: false, voice: false };
    appState.credentials = { pattern: null, face: null, voice: null };
    saveState();
    checkSetupStatus();
    showMessage('faceMessage', 'Security reset. Please set up locks again.', 'msg-info');
    showMessage('patternMessage', 'Security reset. Please set up locks again.', 'msg-info');
    showMessage('voiceMessage', 'Security reset. Please set up locks again.', 'msg-info');
  }
});

// ==========================================
// UI & NAVIGATION LOGIC
// ==========================================

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Remove active from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Add active to clicked
    const targetTab = e.target.dataset.tab;
    e.target.classList.add('active');
    document.getElementById(`tab-${targetTab}`).classList.add('active');

    // Handle tab-specific logic
    if (targetTab === 'face') {
      startWebcam();
    } else {
      stopWebcam();
    }
  });
});

// Setup Mode vs Auth Mode
function checkSetupStatus() {
  const setPatternBtn = document.getElementById('setPatternBtn');
  const setFaceBtn = document.getElementById('setFaceBtn');
  const setVoiceBtn = document.getElementById('setVoiceBtn');
  const verifyFaceBtn = document.getElementById('verifyFaceBtn');

  // Pattern
  if (!appState.isSetup.pattern) {
    setPatternBtn.style.display = 'inline-block';
    showMessage('patternMessage', 'No pattern set. Draw a pattern and click Set.', 'msg-info');
  } else {
    setPatternBtn.style.display = 'none';
    showMessage('patternMessage', 'Draw pattern to unlock.', '');
  }

  // Face
  if (!appState.isSetup.face) {
    setFaceBtn.style.display = 'inline-block';
    verifyFaceBtn.style.display = 'none';
    showMessage('faceMessage', 'No face registered. Click Set as Reference Face.', 'msg-info');
  } else {
    setFaceBtn.style.display = 'none';
    verifyFaceBtn.style.display = 'inline-block';
    showMessage('faceMessage', 'Look at camera and click Verify.', '');
  }

  // Voice
  if (!appState.isSetup.voice) {
    setVoiceBtn.style.display = 'inline-block';
    showMessage('voiceMessage', 'No phrase set. Speak and click Set.', 'msg-info');
  } else {
    setVoiceBtn.style.display = 'none';
    showMessage('voiceMessage', 'Speak your secret phrase to unlock.', '');
  }
}

// Utility: Show Message
function showMessage(elementId, text, className) {
  const el = document.getElementById(elementId);
  el.textContent = text;
  el.className = 'message ' + className;
}

// Success Unlock
function unlockLocker(method) {
  stopWebcam();
  showScreen('dashboard-screen');
  renderDocuments();
  console.log(`Unlocked via ${method}`);
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  showScreen('auth-screen');
  checkSetupStatus();
  // Reset pattern UI
  drawnPattern = [];
  drawGrid();
});

// ==========================================
// DOCUMENT MANAGEMENT LOGIC
// ==========================================

document.getElementById('uploadBtn').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const base64Data = event.target.result;

    const newDoc = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      data: base64Data,
      timestamp: new Date().toISOString()
    };

    appState.documents.push(newDoc);
    saveState();
    renderDocuments();

    showMessage('uploadMessage', 'File secured successfully!', 'msg-success');
    setTimeout(() => showMessage('uploadMessage', '', ''), 3000);
  };

  reader.onerror = () => {
    showMessage('uploadMessage', 'Failed to read file.', 'msg-error');
  };

  reader.readAsDataURL(file);
});

function renderDocuments() {
  const grid = document.getElementById('documentsGrid');
  grid.innerHTML = '';

  if (appState.documents.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No secure documents yet.</p>';
    return;
  }

  appState.documents.forEach(doc => {
    const card = document.createElement('div');
    card.className = 'doc-card';
    card.onclick = () => viewDocument(doc.id);

    if (doc.type.startsWith('image/')) {
      card.innerHTML = `
        <img src="${doc.data}" class="doc-preview" alt="preview">
        <div class="doc-name">${doc.name}</div>
      `;
    } else {
      card.innerHTML = `
        <div class="doc-icon">📄</div>
        <div class="doc-name">${doc.name}</div>
      `;
    }

    grid.appendChild(card);
  });
}

// Modal View
const modal = document.getElementById('docModal');
const closeBtn = document.querySelector('.close-modal');

closeBtn.onclick = () => {
  modal.classList.remove('active');
  document.getElementById('modalContentArea').innerHTML = '';
}

function viewDocument(id) {
  const doc = appState.documents.find(d => d.id === id);
  if (!doc) return;

  const contentArea = document.getElementById('modalContentArea');
  contentArea.innerHTML = '';

  if (doc.type.startsWith('image/')) {
    const img = document.createElement('img');
    img.src = doc.data;
    contentArea.appendChild(img);
  } else {
    // PDF or other - generic fallback
    const iframe = document.createElement('iframe');
    iframe.src = doc.data;
    iframe.style.width = '100%';
    iframe.style.height = '80vh';
    iframe.style.border = 'none';
    contentArea.appendChild(iframe);
  }

  modal.classList.add('active');
}

// INIT
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  checkSetupStatus();
});

// ==========================================
// STUBS FOR MODULES (To be implemented)
// ==========================================

// --- Pattern Lock Stub ---
const canvas = document.getElementById('patternCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 3;
const pointRadius = 10;
const points = [];
let drawnPattern = [];
let isDrawing = false;

// Initialize points
const step = canvas.width / (gridSize + 1);
for (let i = 0; i < gridSize; i++) {
  for (let j = 0; j < gridSize; j++) {
    points.push({
      x: step * (j + 1),
      y: step * (i + 1),
      index: i * gridSize + j
    });
  }
}

function drawGrid(mouseX, mouseY) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw lines
  if (drawnPattern.length > 0) {
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(points[drawnPattern[0]].x, points[drawnPattern[0]].y);
    for (let i = 1; i < drawnPattern.length; i++) {
      ctx.lineTo(points[drawnPattern[i]].x, points[drawnPattern[i]].y);
    }

    if (isDrawing && mouseX !== undefined && mouseY !== undefined) {
      ctx.lineTo(mouseX, mouseY);
    }
    ctx.stroke();
  }

  // Draw points
  for (let i = 0; i < points.length; i++) {
    ctx.beginPath();
    ctx.arc(points[i].x, points[i].y, pointRadius, 0, Math.PI * 2);
    ctx.fillStyle = drawnPattern.includes(i) ? '#3b82f6' : '#475569';
    ctx.fill();
    if (drawnPattern.includes(i)) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 8;
      ctx.stroke();
    }
  }
}

function getPointIndex(x, y) {
  for (let i = 0; i < points.length; i++) {
    const dx = points[i].x - x;
    const dy = points[i].y - y;
    if (dx * dx + dy * dy < (pointRadius * 3) * (pointRadius * 3)) {
      return i;
    }
  }
  return -1;
}

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function handleStart(e) {
  if (e.cancelable) e.preventDefault();
  const pos = getMousePos(e);
  const index = getPointIndex(pos.x, pos.y);

  if (index !== -1) {
    isDrawing = true;
    drawnPattern = [index];
    drawGrid(pos.x, pos.y);
    showMessage('patternMessage', 'Drawing...', '');
  }
}

function handleMove(e) {
  if (!isDrawing) return;
  if (e.cancelable) e.preventDefault();

  const pos = getMousePos(e);
  const index = getPointIndex(pos.x, pos.y);

  if (index !== -1 && !drawnPattern.includes(index)) {
    drawnPattern.push(index);
  }

  drawGrid(pos.x, pos.y);
}

function handleEnd() {
  if (!isDrawing) return;
  isDrawing = false;
  drawGrid();

  if (drawnPattern.length < 4) {
    showMessage('patternMessage', 'Pattern too short (min 4 nodes).', 'msg-error');
    setTimeout(() => { drawnPattern = []; drawGrid(); }, 1000);
    return;
  }

  if (!appState.isSetup.pattern) {
    // Setup mode logic handled by button
  } else {
    // Auth mode
    if (JSON.stringify(drawnPattern) === JSON.stringify(appState.credentials.pattern)) {
      showMessage('patternMessage', 'Pattern correct!', 'msg-success');
      setTimeout(() => unlockLocker('Pattern'), 500);
    } else {
      showMessage('patternMessage', 'Incorrect pattern.', 'msg-error');
      setTimeout(() => { drawnPattern = []; drawGrid(); }, 1000);
    }
  }
}

// Mouse events
canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd); // Attach to window to catch releases outside canvas

// Touch events
canvas.addEventListener('touchstart', handleStart, {passive: false});
canvas.addEventListener('touchmove', handleMove, {passive: false});
window.addEventListener('touchend', handleEnd);

document.getElementById('setPatternBtn').addEventListener('click', () => {
  if (drawnPattern.length >= 4) {
    appState.isSetup.pattern = true;
    appState.credentials.pattern = [...drawnPattern];
    saveState();
    checkSetupStatus();
    showMessage('patternMessage', 'Pattern saved successfully!', 'msg-success');
    drawnPattern = [];
    drawGrid();
  } else {
    showMessage('patternMessage', 'Draw a pattern first (min 4 nodes).', 'msg-error');
  }
});

// Initial draw
drawGrid();

// ==========================================
// FACE LOCK IMPLEMENTATION (MSE Pixel Diffing)
// ==========================================
const video = document.getElementById('webcam');
const snapshotCanvas = document.getElementById('snapshotCanvas');
const snapCtx = snapshotCanvas.getContext('2d');
let localStream = null;

async function startWebcam() {
  if (localStream) return;
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = localStream;
  } catch (e) {
    console.error("Camera access denied", e);
    showMessage('faceMessage', 'Camera access denied or unavailable.', 'msg-error');
  }
}

function stopWebcam() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    localStream = null;
  }
}

function captureFrame() {
  // Set canvas size to video size
  snapshotCanvas.width = video.videoWidth || 300;
  snapshotCanvas.height = video.videoHeight || 300;

  // Draw current video frame to canvas
  snapCtx.drawImage(video, 0, 0, snapshotCanvas.width, snapshotCanvas.height);

  // Get image data
  return snapCtx.getImageData(0, 0, snapshotCanvas.width, snapshotCanvas.height);
}

document.getElementById('setFaceBtn').addEventListener('click', () => {
  if (!localStream) {
    showMessage('faceMessage', 'Start camera first.', 'msg-error');
    return;
  }

  const imageData = captureFrame();

  // Convert image data to base64 for storage
  const base64Image = snapshotCanvas.toDataURL('image/jpeg', 0.8);

  appState.isSetup.face = true;
  appState.credentials.face = base64Image;
  saveState();
  checkSetupStatus();
  showMessage('faceMessage', 'Face reference saved successfully!', 'msg-success');
});

document.getElementById('verifyFaceBtn').addEventListener('click', () => {
  if (!localStream) {
    showMessage('faceMessage', 'Camera is not active.', 'msg-error');
    return;
  }

  if (!appState.credentials.face) {
    showMessage('faceMessage', 'No face reference set.', 'msg-error');
    return;
  }

  showMessage('faceMessage', 'Verifying...', '');

  // Capture current frame
  const currentImageData = captureFrame();

  // Load stored reference image
  const img = new Image();
  img.onload = () => {
    // Draw stored image to canvas to get ImageData
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = snapshotCanvas.width;
    tempCanvas.height = snapshotCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

    const referenceImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

    // Compare current and reference using MSE
    const mse = calculateMSE(currentImageData, referenceImageData);
    console.log('Face MSE:', mse);

    // Threshold (lower is more similar).
    // Simple pixel diffing is highly sensitive to lighting/positioning.
    // A threshold of ~3000-5000 is extremely lenient, ~1000 is strict.
    const THRESHOLD = 4500;

    if (mse < THRESHOLD) {
      showMessage('faceMessage', 'Face verified!', 'msg-success');
      setTimeout(() => unlockLocker('Face'), 1000);
    } else {
      showMessage('faceMessage', 'Face not recognized. Try adjusting lighting or position.', 'msg-error');
    }
  };
  img.src = appState.credentials.face;
});

// Mean Squared Error for images
function calculateMSE(imgData1, imgData2) {
  const d1 = imgData1.data;
  const d2 = imgData2.data;

  if (d1.length !== d2.length) return Infinity;

  let sum = 0;
  // Step by 4 (R, G, B, A)
  for (let i = 0; i < d1.length; i += 4) {
    // Only compare grayscale luminance for simplicity/robustness
    const l1 = 0.299 * d1[i] + 0.587 * d1[i+1] + 0.114 * d1[i+2];
    const l2 = 0.299 * d2[i] + 0.587 * d2[i+1] + 0.114 * d2[i+2];

    const diff = l1 - l2;
    sum += diff * diff;
  }

  return sum / (d1.length / 4);
}

// ==========================================
// VOICE LOCK IMPLEMENTATION
// ==========================================
const micBtn = document.getElementById('micBtn');
const transcriptDiv = document.getElementById('voiceTranscript');
let recognition = null;
let currentTranscript = '';

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US'; // Adjust if needed
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    micBtn.classList.add('listening');
    transcriptDiv.textContent = 'Listening...';
    showMessage('voiceMessage', '', '');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim().toLowerCase();
    currentTranscript = transcript;
    transcriptDiv.textContent = `"${transcript}"`;

    if (!appState.isSetup.voice) {
      // Setup mode: just show the transcript
    } else {
      // Auth mode: check if it matches
      if (transcript === appState.credentials.voice) {
        showMessage('voiceMessage', 'Voice recognized!', 'msg-success');
        setTimeout(() => unlockLocker('Voice'), 1000);
      } else {
        showMessage('voiceMessage', 'Incorrect phrase. Try again.', 'msg-error');
      }
    }
  };

  recognition.onspeechend = () => {
    recognition.stop();
  };

  recognition.onend = () => {
    micBtn.classList.remove('listening');
    if (transcriptDiv.textContent === 'Listening...') {
        transcriptDiv.textContent = '';
    }
  };

  recognition.onerror = (event) => {
    micBtn.classList.remove('listening');
    transcriptDiv.textContent = '';
    showMessage('voiceMessage', `Error: ${event.error}`, 'msg-error');
  };

  micBtn.addEventListener('click', () => {
    if (micBtn.classList.contains('listening')) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });

} else {
  micBtn.disabled = true;
  transcriptDiv.textContent = 'Speech Recognition API not supported in this browser.';
}

document.getElementById('setVoiceBtn').addEventListener('click', () => {
  if (currentTranscript.length > 0) {
    appState.isSetup.voice = true;
    appState.credentials.voice = currentTranscript;
    saveState();
    checkSetupStatus();
    showMessage('voiceMessage', 'Voice phrase saved successfully!', 'msg-success');
    currentTranscript = '';
    transcriptDiv.textContent = '';
  } else {
    showMessage('voiceMessage', 'Please speak a phrase first.', 'msg-error');
  }
});
