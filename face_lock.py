import cv2
import face_recognition
import numpy as np
import os
import sys

def main():
    # 1. Provide the path to the reference image (the authorized person)
    # The user should replace 'owner.jpg' with their actual picture
    reference_image_path = "owner.jpg"

    if not os.path.exists(reference_image_path):
        print(f"Error: Could not find the reference image '{reference_image_path}'.")
        print("Please place an image named 'owner.jpg' in this directory.")
        sys.exit(1)

    print("Loading reference image for advanced profile (This may take a moment)...")
    # Load the reference image and get its face encoding
    owner_image = face_recognition.load_image_file(reference_image_path)

    # ADVANCED: Use num_jitters=100 to calculate the face encoding 100 times and average it.
    # This creates a highly robust and accurate reference profile.
    # We also explicitly specify model='large'
    owner_face_encodings = face_recognition.face_encodings(owner_image, num_jitters=100, model="large")

    if len(owner_face_encodings) == 0:
        print("Error: No face found in the reference image. Please use a clear and well-lit picture.")
        sys.exit(1)

    owner_face_encoding = owner_face_encodings[0]
    print("Advanced reference profile created successfully!")

    # 2. Initialize the webcam
    print("Starting webcam...")
    video_capture = cv2.VideoCapture(0)

    if not video_capture.isOpened():
        print("Error: Could not open the webcam. Please ensure it is connected.")
        sys.exit(1)

    print("Webcam started. Press 'q' to quit.")

    while True:
        # Capture a single frame of video
        ret, frame = video_capture.read()

        if not ret:
            print("Failed to grab frame from webcam. Exiting...")
            break

        # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Find all the faces and face encodings in the current frame of video
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        # Loop through each face in this frame of video
        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            # Calculate the face distance (lower is better, 0 is a perfect match)
            face_distances = face_recognition.face_distance([owner_face_encoding], face_encoding)
            best_match_distance = face_distances[0]

            # ADVANCED: Strict tolerance for high security.
            # Default is 0.6. We use 0.45 for much stricter, granular matching.
            STRICT_TOLERANCE = 0.45

            # Calculate confidence percentage for display
            confidence = max(0, round((1.0 - best_match_distance) * 100, 1))

            if best_match_distance <= STRICT_TOLERANCE:
                status = "UNLOCKED"
                color = (0, 255, 0) # Green for unlocked
            else:
                status = "LOCKED"
                color = (0, 0, 255) # Red for locked

            text_to_display = f"{status} ({confidence}%)"

            # Draw a box around the face
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)

            # Draw a label with a name below the face
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
            font = cv2.FONT_HERSHEY_DUPLEX

            # Adjust font scale based on text length to ensure it fits, or just use a smaller font
            cv2.putText(frame, text_to_display, (left + 6, bottom - 6), font, 0.6, (255, 255, 255), 1)

        # Display the resulting image
        cv2.imshow('Face Lock System', frame)

        # Hit 'q' on the keyboard to quit!
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release handle to the webcam
    video_capture.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
