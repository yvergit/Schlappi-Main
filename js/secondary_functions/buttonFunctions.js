import { selectedObject, copyObject, pasteObject, changeLightDirection, directions, loadImage, exportSceneAsImage, checkForselectedObject } from "../app.js";
import { scaleHorizontal, scaleObject, rotateObject } from "./scaleAndRotateObject.js";

let currentDirectionIndex = 0;

function showSelectObject() {
    document.getElementById('objectContainer').style.display = 'flex';
}

// input to load new image
function loadNewImage() {
    // Create a file input dynamically
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    // When a file is selected
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return; // If no file selected, exit

        const fileReader = new FileReader();
        
        // On file load
        fileReader.onload = function(e) {
            loadImage(e.target.result)
        };

        fileReader.readAsDataURL(file); // Read the selected file as a Data URL
    };

    input.click(); // Trigger the file input dialog
}

// Button Functions
function changeLight() {
    changeLightDirection(directions[currentDirectionIndex]);
    currentDirectionIndex = (currentDirectionIndex + 1) % directions.length;
}

// Function to increase size
function increaseSize() {
    checkForselectedObject();
    if (selectedObject) {
        scaleObject(selectedObject, true, 1.01); // Assuming scaleObject is defined elsewhere
    }
}

// Function to decrease size
function decreaseSize() {
    checkForselectedObject();
    if (selectedObject) {
        scaleObject(selectedObject, false, 0.99); // Assuming scaleObject is defined elsewhere
    }
}

// Function to increase horizontal size
function increaseHorizontalSize() {
    checkForselectedObject();
    if (selectedObject) {
        scaleHorizontal(selectedObject, true, 1.01); // Assuming scaleHorizontal is defined elsewhere
    }
}

// Function to decrease horizontal size
function decreaseHorizontalSize() {
    checkForselectedObject();
    if (selectedObject) {
        scaleHorizontal(selectedObject, false, 0.99); // Assuming scaleHorizontal is defined elsewhere
    }
}

function rotateLeft(){
    checkForselectedObject();
    if (selectedObject){
        rotateObject(selectedObject, false);
    }
}

function rotateRight(){
    checkForselectedObject();
    if(selectedObject){
        rotateObject(selectedObject, true);
    }
}

let intervalId = null;
// Event listeners for the buttons
// Function to handle holding down a button for continuous execution
function startContinuousExecution(action) {
    if (intervalId) return; // Prevent multiple intervals

    action(); // Call the action immediately
    intervalId = setInterval(action, 100); // Repeat action every 100 ms
}

// Function to stop the continuous execution
function stopContinuousExecution() {
    clearInterval(intervalId);
    intervalId = null;
}

// Event listeners for the buttons
document.getElementById('increaseSizeButton').addEventListener('mousedown', () => startContinuousExecution(increaseSize));
document.getElementById('decreaseSizeButton').addEventListener('mousedown', () => startContinuousExecution(decreaseSize));
document.getElementById('increaseHorizontalSizeButton').addEventListener('mousedown', () => startContinuousExecution(increaseHorizontalSize));
document.getElementById('decreaseHorizontalSizeButton').addEventListener('mousedown', () => startContinuousExecution(decreaseHorizontalSize));
document.getElementById("rotateLeftButton").addEventListener('mousedown', () => startContinuousExecution(rotateLeft));
document.getElementById("rotateRightButton").addEventListener('mousedown', () => startContinuousExecution(rotateRight));

document.getElementById('selectButton').addEventListener('click', showSelectObject);
document.getElementById('uploadImageButton').addEventListener('click', loadNewImage);
document.getElementById('makeScreenshot').addEventListener('click', exportSceneAsImage);
document.getElementById('changeLightDirection').addEventListener('click', changeLight);

// Copy and paste functions from app.js
document.getElementById('copyButton').addEventListener('click', copyObject);
document.getElementById('pasteButton').addEventListener('click', pasteObject);

// Stop continuous execution on mouseup or mouseleave
document.querySelectorAll('.icon-button').forEach(button => {
    button.addEventListener('mouseup', stopContinuousExecution);
    button.addEventListener('mouseleave', stopContinuousExecution);
});
