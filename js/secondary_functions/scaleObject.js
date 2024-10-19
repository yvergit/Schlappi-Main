import { updateBoundingBox } from "../app.js";
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

export function scaleHorizontal(object, bool) {
    // Scale the object horizontally based on the boolean flag
    if (bool) {
        object.scale.x *= 1.01;  // Increase scale
    } else {
        object.scale.x *= 0.99;  // Decrease scale
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