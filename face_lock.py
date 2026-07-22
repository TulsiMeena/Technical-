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

    print("Loading reference image...")
    # Load the reference image and get its face encoding
    owner_image = face_recognition.load_image_file(reference_image_path)
    owner_face_encodings = face_recognition.face_encodings(owner_image)

    if len(owner_face_encodings) == 0:
        print("Error: No face found in the reference image. Please use a clear picture.")
        sys.exit(1)

    owner_face_encoding = owner_face_encodings[0]
    print("Reference image loaded successfully!")

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
            # See if the face is a match for the known face(s)
            matches = face_recognition.compare_faces([owner_face_encoding], face_encoding)

            # Use the known face with the smallest distance to the new face
            face_distances = face_recognition.face_distance([owner_face_encoding], face_encoding)
            best_match_index = np.argmin(face_distances)

            if matches[best_match_index]:
                name = "UNLOCKED"
                color = (0, 255, 0) # Green for unlocked
            else:
                name = "LOCKED"
                color = (0, 0, 255) # Red for locked

            # Draw a box around the face
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)

            # Draw a label with a name below the face
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)

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
