// Function to add object buttons for selecting object at start
import { loadSelectedObject } from "../app.js";
export function createSelectObjectButtons(availableObjects) {
    //for manual model button creation
    //selectObjectButton("model1", True, objectButtonsContainer);
    //selectObjectButton("model2", True, objectButtonsContainer);

    availableObjects.forEach(object => {
        selectObjectButton(object, true);
    });
}

// Select object buttons creation.
//  Params object name, bool hasVariants, container
function selectObjectButton(object, hasVariants){
    if (hasVariants){
        const normalContainer = document.getElementById('normalContainer');
        const bakContainer = document.getElementById('nobakContainer');
        const straightContainer = document.getElementById('straightContainer');
        const straightnbContainer = document.getElementById('straightnbContainer');
        createObjectButton(object, normalContainer);
        createObjectButton(object + "nobak", bakContainer);
        createObjectButton(object + "straight", straightContainer);
        createObjectButton(object + "straightnb", straightnbContainer);
    }
}

// Create ui buttons
function createObjectButton(object, container){
    if (!container) {
        console.error(`Container for ${object} not found`);
        return;
    }
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
    container.appendChild(button);
}
