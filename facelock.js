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
let detectionInterval = null;

// The threshold for strict matching (lower is stricter)
const STRICT_DISTANCE = 0.45;

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
    if (detectionInterval) {
        clearInterval(detectionInterval);
    }
    videoSection.classList.add('hidden');
    setupSection.classList.remove('hidden');

    // Reset status
    lockStatus.textContent = "LOCKED (Waiting for match...)";
    lockStatus.className = "lock-status locked";

    const canvas = document.getElementById('overlay');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Process video frames when playing
video.addEventListener('play', () => {
    const canvas = document.getElementById('overlay');
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    // Create a FaceMatcher with strict tolerance
    const faceMatcher = new faceapi.FaceMatcher(
        new faceapi.LabeledFaceDescriptors('Owner', [referenceDescriptor]),
        STRICT_DISTANCE
    );

    detectionInterval = setInterval(async () => {
        if(video.paused || video.ended) return;

        const detections = await faceapi.detectAllFaces(video)
            .withFaceLandmarks()
            .withFaceDescriptors();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        let isUnlocked = false;

        resizedDetections.forEach(detection => {
            const descriptor = detection.descriptor;
            // Find best match based on Euclidean distance
            const bestMatch = faceMatcher.findBestMatch(descriptor);

            // Calculate distance explicitly to show confidence
            const distance = faceapi.euclideanDistance(descriptor, referenceDescriptor);
            const confidence = Math.max(0, Math.round((1 - distance) * 100));

            const box = detection.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {
                label: bestMatch.label === 'Owner' ? `UNLOCKED (${confidence}%)` : `LOCKED (${confidence}%)`,
                boxColor: bestMatch.label === 'Owner' ? '#4CAF50' : '#f44336'
            });
            drawBox.draw(canvas);

            if (bestMatch.label === 'Owner') {
                isUnlocked = true;
            }
        });

        if (isUnlocked) {
            lockStatus.textContent = "UNLOCKED";
            lockStatus.className = "lock-status unlocked";
        } else {
            lockStatus.textContent = "LOCKED";
            lockStatus.className = "lock-status locked";
        }

    }, 100); // Check 10 times a second
});

// Start by loading models
window.addEventListener('load', loadModels);
