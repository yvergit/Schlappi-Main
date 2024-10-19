import * as THREE from 'three';

// Function to change texture of an object
export function changeTexture(selectedObject, materialName, texturePath) {
    // Load the new texture
    const newTexture = new THREE.TextureLoader().load(texturePath, (texture) => {
        // Ensure the texture wraps and repeats
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;  // Enable repeating
        texture.repeat.set(5 * selectedObject.scale.x, 5 * selectedObject.scale.y);

        // Calculate average color
        const averageColor = getAverageColor(texture);
        
        // Apply the texture to the material and set the PVC color
        selectedObject.traverse((child) => {
            if (child.isMesh && child.material.name === materialName) {
                // Create a copy of the existing material
                const originalMaterial = child.material;
                const newMaterial = originalMaterial.clone(); // Clone the original material

                // Update the texture on the new material
                newMaterial.map = texture;
                newMaterial.needsUpdate = true; // Mark the new material for update
                
                // Assign the new material to the mesh
                child.material = newMaterial; // Set the cloned material as the current material
            }
            
            // Copy the PVC material and set the color
            if (child.isMesh && child.material.name === "PVC" && materialName === "Doek") {
                const originalPVCMaterial = child.material; 
                const newPVCMaterial = originalPVCMaterial.clone(); // Clone the PVC material
                
                newPVCMaterial.color.set(averageColor);  // Set the PVC color to average color
                newPVCMaterial.needsUpdate = true; // Ensure the new PVC material is marked for update
                
                child.material = newPVCMaterial; // Assign the cloned and updated PVC material
            }
        });
    });
}


// Function to calculate the average color from the texture
function getAverageColor(texture) {
    // Create a canvas to extract pixel data
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set canvas size to the texture size
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;

    // Draw the texture onto the canvas
    context.drawImage(texture.image, 0, 0);
    
    // Get pixel data from the canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let r = 0, g = 0, b = 0;
    const pixelCount = data.length / 4;

    // Calculate the sum of the RGB values
    for (let i = 0; i < data.length; i += 4) {
        r += data[i];     // Red
        g += data[i + 1]; // Green
        b += data[i + 2]; // Blue
    }

    // Calculate the average
    r = Math.floor(r / pixelCount);
    g = Math.floor(g / pixelCount);
    b = Math.floor(b / pixelCount);

    // Return the average color as a THREE.Color
    return new THREE.Color(`rgb(${r},${g},${b})`);
}
