// Function to add object buttons for selecting object at start
import { loadSelectedObject } from "../app.js";
export function createSelectObjectButtons(availableObjects) {
    const objectButtonsContainer = document.getElementById('objectButtonsContainer');
    objectButtonsContainer.innerHTML = ''; // Clear any existing buttons

    availableObjects.forEach(object => {
        // Create a button for each object
        const button = document.createElement('button');
        
        // Create an image element
        const img = document.createElement('img');
        img.src = `img/${object}.jpg`; // Set the source to the image path

        // Add click event to load the selected object
        button.onclick = () => {
            loadSelectedObject(object); // Call the function to load the selected object
            document.getElementById('objectContainer').style.display = 'none'; // Hide the object container
        };

        // Append image to button and button to the container
        button.appendChild(img);
        objectButtonsContainer.appendChild(button);
    });
}
