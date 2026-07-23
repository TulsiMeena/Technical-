const imageUpload = document.getElementById('imageUpload');
const startBtn = document.getElementById('startWebcamBtn');
const stopBtn = document.getElementById('stopWebcamBtn');
const video = document.getElementById('video');
const loading = document.getElementById('loading');
const setupSection = document.getElementById('setup-section');
const videoSection = document.getElementById('video-section');
const lockStatus = document.getElementById('lock-status');
const uploadStatus = document.getElementById('upload-status');
const preview = document.getElementById('referenceImagePreview');

let referenceDescriptor = null;
let stream = null;
let animationFrameId = null;

// The threshold for strict matching (lower is stricter)
const STRICT_DISTANCE = 0.45;

// Liveness detection variables
let blinkDetected = false;
let isProcessingFrame = false;

// Function to calculate Eye Aspect Ratio (EAR) for blink detection
function calculateEAR(eye) {
    // eye is an array of 6 points.
    // Vertical distances
    const v1 = faceapi.euclideanDistance([eye[1].x, eye[1].y], [eye[5].x, eye[5].y]);
    const v2 = faceapi.euclideanDistance([eye[2].x, eye[2].y], [eye[4].x, eye[4].y]);
    // Horizontal distance
    const h = faceapi.euclideanDistance([eye[0].x, eye[0].y], [eye[3].x, eye[3].y]);

    return (v1 + v2) / (2.0 * h);
}

// Load the models from a reliable CDN
async function loadModels() {
    try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        loading.classList.add('hidden');
        setupSection.classList.remove('hidden');
        console.log("Models loaded successfully.");
    } catch (error) {
        console.error("Error loading models:", error);
        loading.textContent = "Error loading models. Please check console.";
        loading.style.backgroundColor = "#f44336";
    }
}

// Handle reference image upload
imageUpload.addEventListener('change', async () => {
    const file = imageUpload.files[0];
    if (!file) return;

    uploadStatus.textContent = "Analyzing image... (फोटो स्कैन हो रही है...)";
    uploadStatus.style.color = "#FFC107";
    startBtn.disabled = true;

    // Show preview
    const imgUrl = URL.createObjectURL(file);
    preview.src = imgUrl;
    preview.style.display = 'block';

    try {
        const image = await faceapi.bufferToImage(file);
        const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();

        if (detection) {
            referenceDescriptor = detection.descriptor;
            uploadStatus.textContent = "Success! Face profile created. (चेहरे की पहचान बन गई)";
            uploadStatus.style.color = "#4CAF50";
            startBtn.disabled = false;
        } else {
            uploadStatus.textContent = "Error: No face detected. Please use a clearer photo.";
            uploadStatus.style.color = "#f44336";
            referenceDescriptor = null;
        }
    } catch (error) {
        uploadStatus.textContent = "Error analyzing image.";
        uploadStatus.style.color = "#f44336";
        console.error(error);
    }
});

// Start Webcam
startBtn.addEventListener('click', async () => {
    if (!referenceDescriptor) {
        alert("Please upload a reference image first.");
        return;
    }

    setupSection.classList.add('hidden');
    videoSection.classList.remove('hidden');

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;
    } catch (err) {
        alert("Error accessing webcam: " + err.message);
        setupSection.classList.remove('hidden');
        videoSection.classList.add('hidden');
    }
});

// Stop Webcam
stopBtn.addEventListener('click', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    videoSection.classList.add('hidden');
    setupSection.classList.remove('hidden');
    blinkDetected = false;
    document.getElementById('liveness-status').textContent = "Anti-Spoofing: Please BLINK to prove you are real. (फोटो से बचने के लिए अपनी पलकें झपकाएं)";
    document.getElementById('liveness-status').style.backgroundColor = "#ff9800";

    // Reset status
    lockStatus.textContent = "LOCKED (Waiting for match...)";
    lockStatus.className = "lock-status locked";

    const canvas = document.getElementById('overlay');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Process video frames when playing (Zero Lag Architecture)
video.addEventListener('play', () => {
    const canvas = document.getElementById('overlay');
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    // Create a FaceMatcher with strict tolerance
    const faceMatcher = new faceapi.FaceMatcher(
        new faceapi.LabeledFaceDescriptors('Owner', [referenceDescriptor]),
        STRICT_DISTANCE
    );

    const livenessStatus = document.getElementById('liveness-status');

    async function detectFace() {
        if(video.paused || video.ended) return;

        // Skip frame if we are still processing the previous one (prevents lag/freezing)
        if (isProcessingFrame) {
            animationFrameId = requestAnimationFrame(detectFace);
            return;
        }

        isProcessingFrame = true;

        try {
            // Ultra-fast detection config (tiny face detector is faster for realtime)
            const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
                .withFaceLandmarks()
                .withFaceDescriptors();

            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

            let isUnlocked = false;

            resizedDetections.forEach(detection => {
                // Anti-Spoofing: Check for blink (EAR)
                const landmarks = detection.landmarks;
                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();

                const leftEAR = calculateEAR(leftEye);
                const rightEAR = calculateEAR(rightEye);
                const avgEAR = (leftEAR + rightEAR) / 2.0;

                // Threshold for blink (usually ~0.2 or 0.25)
                if (avgEAR < 0.22) {
                    blinkDetected = true;
                    livenessStatus.textContent = "Real Person Verified! (असली इंसान की पुष्टि हो गई)";
                    livenessStatus.style.backgroundColor = "#4CAF50";
                }

                const descriptor = detection.descriptor;
                // Find best match based on Euclidean distance
                const bestMatch = faceMatcher.findBestMatch(descriptor);

                // Calculate distance explicitly to show confidence
                const distance = faceapi.euclideanDistance(descriptor, referenceDescriptor);
                const confidence = Math.max(0, Math.round((1 - distance) * 100));

                const box = detection.detection.box;

                // Only unlock if face matches AND they have blinked (proven alive)
                const isMatch = bestMatch.label === 'Owner';
                const finalColor = (isMatch && blinkDetected) ? '#4CAF50' : '#f44336';
                let labelText = `LOCKED (${confidence}%)`;

                if (isMatch) {
                    if (blinkDetected) {
                        labelText = `UNLOCKED (${confidence}%)`;
                        isUnlocked = true;
                    } else {
                        labelText = `MATCHED, Waiting for BLINK...`;
                    }
                }

                const drawBox = new faceapi.draw.DrawBox(box, {
                    label: labelText,
                    boxColor: finalColor
                });
                drawBox.draw(canvas);
            });

            if (isUnlocked) {
                lockStatus.textContent = "UNLOCKED";
                lockStatus.className = "lock-status unlocked";
            } else {
                lockStatus.textContent = "LOCKED";
                lockStatus.className = "lock-status locked";
            }

        } catch (e) {
            console.error(e);
        }

        isProcessingFrame = false;
        // Schedule next frame immediately for zero-lag
        animationFrameId = requestAnimationFrame(detectFace);
    }

    // Start loop
    detectFace();
});

// Start by loading models
window.addEventListener('load', loadModels);
