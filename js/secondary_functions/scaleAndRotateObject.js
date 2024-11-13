import { updateBoundingBox } from "../app.js";
import * as THREE from 'three';
export function scaleObject(object, bool) {
    // Scale the object based on the boolean value
    if (bool === true) {
        object.scale.x *= 1.01;
        object.scale.y *= 1.01;
        object.scale.z *= 1.01;
    } else {
        object.scale.x *= 0.99;
        object.scale.y *= 0.99;
        object.scale.z *= 0.99;
    }
    updateBoundingBox();
    repeatTexture(object);
}

export function rotateObjectZ(object, rotateRight){
    if(rotateRight){
        object.rotation.z -= 0.01;
    }
    else{
        object.rotation.z += 0.01;
    }
    updateBoundingBox();
}

export function rotateObjectY(object, rotateRight) {
    // Rotate the object around the Y-axis
    if (rotateRight) {
        object.rotation.y -= 0.01;  // Rotate to the right
    } else {
        object.rotation.y += 0.01;  // Rotate to the left
    }

    // Get the new bounding box after rotation
    let boundingBox = new THREE.Box3().setFromObject(object);

    // If the back of the object is behind z=0 (minZ < 0)
    if (boundingBox.min.z < 0) {
        // Move the object forward until its back side touches z=0
        object.position.z -= boundingBox.min.z;  // Adjust position so back aligns with z=0
    }

    // If the front of the object is ahead of z=0 (maxZ > 0)
    else if (boundingBox.max.z > 0) {
        // Move the object backward until its front side touches z=0
        object.position.z -= boundingBox.max.z;  // Adjust position so front aligns with z=0
    }

    if(object.position.z < 0){
        object.position.z += boundingBox.max.z;
    }

    // Update the bounding box after the position adjustment
    updateBoundingBox();
}




export function scaleHorizontal(object, bool, scaleFactor) {
    // Scale the object horizontally based on the boolean flag
    if (bool) {
        object.scale.x *= scaleFactor;  // Increase scale
    } else {
        object.scale.x *= scaleFactor;  // Decrease scale
    }

    // Update the object's bounding box after scaling
    updateBoundingBox();

    // Update the texture repeat based on the new scale
    repeatTexture(object);
}

function repeatTexture(object) {
    object.traverse(function (child) {
        if (child.isMesh && child.material && child.material.map) {
            let texture = child.material.map;

            // Check if the texture is already cloned for the current material
            if (!texture.isCloned) {
                texture = texture.clone(); // Clone the texture
                texture.isCloned = true;   // Mark the cloned texture
                child.material.map = texture; // Assign the cloned texture to the material
            }

            texture.needsUpdate = true;

            // Adjust the repeat factor based on the object's scale
            texture.repeat.set(5 * object.scale.x, 5 * object.scale.y);
        }
    });
}