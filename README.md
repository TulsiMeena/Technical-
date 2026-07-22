# Advanced Face Lock System

An advanced face lock authentication system built with Python (`face_recognition`), and a newly added Web-based version using HTML, CSS, and JavaScript (`face-api.js`).

## Web Version (No Installation Required!) / वेब वर्जन (बिना इंस्टॉल किए चलाएं!)

You can now run this entirely in your web browser without installing anything!
(अब आप इसे बिना कुछ इंस्टॉल किए सीधे अपने वेब ब्राउज़र में चला सकते हैं!)

1. Just open `facelock.html` in your web browser (Chrome, Edge, Firefox, Safari).
   (बस अपने वेब ब्राउज़र में `facelock.html` खोलें।)
2. Upload a clear picture of your face to act as the key.
   (चाबी के रूप में काम करने के लिए अपने चेहरे की एक स्पष्ट तस्वीर अपलोड करें।)
3. Click "Start Face Lock" and allow camera permissions.
   ("Start Face Lock" पर क्लिक करें और कैमरे की अनुमति दें।)

---

## Python Version / पायथन वर्जन

A Python-based face lock authentication system built with OpenCV and the `face_recognition` library.

## Prerequisites / पूर्व शर्तें

Make sure you have Python installed on your computer. You will also need a working webcam.
(सुनिश्चित करें कि आपके कंप्यूटर पर Python स्थापित है। आपको एक काम करने वाले वेबकैम की भी आवश्यकता होगी।)

You need to have `cmake` and a C++ compiler installed on your system to build `dlib` if it's not pre-built for your platform.

## Setup Instructions / सेटअप निर्देश

1. **Install dependencies / आवश्यक पैकेज स्थापित करें:**
   Open your terminal or command prompt and run:
   (अपना टर्मिनल या कमांड प्रॉम्प्ट खोलें और चलाएं:)
   ```bash
   pip install -r requirements.txt
   ```

2. **Add a Reference Image / एक संदर्भ छवि (Reference Image) जोड़ें:**
   - Take a clear picture of your face.
   - Save the image in this directory and name it **`owner.jpg`**.
   - (अपने चेहरे की एक स्पष्ट तस्वीर लें। छवि को इसी फ़ोल्डर में सहेजें और इसका नाम **`owner.jpg`** रखें।)

3. **Run the Code / कोड चलाएं:**
   Run the python script:
   (पायथन स्क्रिप्ट चलाएं:)
   ```bash
   python face_lock.py
   ```

4. **How it works / यह कैसे काम करता है:**
   - The webcam will turn on.
   - If the person in front of the camera matches `owner.jpg`, it will show **UNLOCKED** (Green).
   - If the person does not match or is unrecognized, it will show **LOCKED** (Red).
   - Press **`q`** on your keyboard to close the webcam and exit the program.
   - (वेबकैम चालू हो जाएगा। यदि कैमरे के सामने वाला व्यक्ति `owner.jpg` से मेल खाता है, तो यह **UNLOCKED** (हरा) दिखाएगा। यदि व्यक्ति मेल नहीं खाता है या अज्ञात है, तो यह **LOCKED** (लाल) दिखाएगा। वेबकैम बंद करने और प्रोग्राम से बाहर निकलने के लिए अपने कीबोर्ड पर **`q`** दबाएं।)
