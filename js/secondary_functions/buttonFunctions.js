import { selectedObject, copyObject, pasteObject, changeLightDirection, directions, loadNewImage, exportSceneAsImage } from "../app.js";
import { scaleHorizontal, scaleObject } from "./scaleObject.js";

let currentDirectionIndex = 0;

function showSelectObject() {
    document.getElementById('objectContainer').style.display = 'block';
}

// Button Functions
function changeLight() {
    changeLightDirection(directions[currentDirectionIndex]);
    currentDirectionIndex = (currentDirectionIndex + 1) % directions.length;
}

// Function to increase size
function increaseSize() {
    if (selectedObject) {
        scaleObject(selectedObject, true); // Assuming scaleObject is defined elsewhere
    }
}

// Function to decrease size
function decreaseSize() {
    if (selectedObject) {
        scaleObject(selectedObject, false); // Assuming scaleObject is defined elsewhere
    }
}

// Function to increase horizontal size
function increaseHorizontalSize() {
    if (selectedObject) {
        scaleHorizontal(selectedObject, true); // Assuming scaleHorizontal is defined elsewhere
    }
}

// Function to decrease horizontal size
function decreaseHorizontalSize() {
    if (selectedObject) {
        scaleHorizontal(selectedObject, false); // Assuming scaleHorizontal is defined elsewhere
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

// Copy and paste functions from app.js
document.getElementById('selectButton').addEventListener('click', showSelectObject);
document.getElementById('uploadImageButton').addEventListener('click', loadNewImage);
document.getElementById('makeScreenshot').addEventListener('click', exportSceneAsImage);
document.getElementById('changeLightDirection').addEventListener('click', changeLight);
document.getElementById('copyButton').addEventListener('click', copyObject);
document.getElementById('pasteButton').addEventListener('click', pasteObject);

// Stop continuous execution on mouseup or mouseleave
document.querySelectorAll('.icon-button').forEach(button => {
    button.addEventListener('mouseup', stopContinuousExecution);
    button.addEventListener('mouseleave', stopContinuousExecution);
});
