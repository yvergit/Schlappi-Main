import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

//import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//import of secondary functions
import { createMaterialButtons } from './secondary_functions/materialAndBakButtons.js';
import { changeTexture } from './secondary_functions/changeTexture.js';
import { createSelectObjectButtons } from './secondary_functions/selectObjectButtons.js';

let scene, camera, renderer, controls;
let availableObjects  = ["model1", "model2", "model5", "model23", "model15"];
let selectedObject = null;
export {selectedObject};
let objModel, imagePlane; // Correct gebruik van globale variabelen
let boxHelper;
let clipboardObject = null; // Voor het tijdelijk opslaan van het gekopieerde object
let switchableObjects = []; // Lijst van objecten waartussen geschakeld kan worden
let directionalLight; // Definieer directionalLight aan het begin van je script
let lightIndex = 0;
let lights = [];
let doekTeller = 1;
export {doekTeller};
let kleurArray = [0xffffff, 0x80003a, 0x506432, 0xffc500, 0xb30019, 0xec410b];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let isDragging = false;
const directions = ["Voor", "Links", "Rechts"]; // De mogelijke richtingen
export {directions};

// Event listener voor de "Upload en Start"-knop
export function init_upload() {
    // Show the file upload section
    const uploadWrapper = document.getElementById('uploadWrapper');
    uploadWrapper.style.display = 'block';

    // Add the file upload input and button dynamically
    uploadWrapper.innerHTML = `
        <input type="file" id="imageUpload" accept="image/*">
        <button id="uploadButton">Upload en Start</button>
    `;

    document.getElementById('uploadButton').addEventListener('click', function() {
        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload.files.length === 0) {
            alert('Selecteer a.u.b. een afbeelding.');
            return;
        }
        
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
            // Hide the upload interface and show relevant sections
            document.getElementById('uploadContainer').style.display = 'none'; 
            document.getElementById('homeImage').style.display = 'none'; 
            document.getElementById('homeForm').style.display = 'none'; 
            document.getElementById('objectContainer').style.display = 'flex';
            document.getElementById('materialButtonsContainer').style.display = 'flex';
            document.getElementById('bakButtonsContainer').style.display = 'flex';
            document.getElementById('topBanner').style.display = 'flex';
            document.getElementById('buttonContainer').style.display = 'none';
            document.getElementById('right-bottom').style.display = 'flex';
            

            // Start the Three.js scene with the image as argument
            init(event.target.result);
        };
        fileReader.readAsDataURL(imageUpload.files[0]); // Read the file as a data URL
    });
}

//uncomment om upload button zonder verify code te krijgen
//init_upload();

function init(textureSrc) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 8;
    camera.position.y = 2;

    // Voeg je camera toe aan de scene, net zoals je met een PerspectiveCamera zou doen
    scene.add(camera);

    // Toon de assen als hulplijnen
    const axesHelper = new THREE.AxesHelper(5); // De parameter specificeert de lengte van de assen
    //scene.add(axesHelper); // Voeg x, y en z as zichtbaar toe
    
    // Hier initialiseer je de scene, camera, en renderer
    renderer = new THREE.WebGLRenderer({ alpha: false, preserveDrawingBuffer: true });
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0xADD8E6, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // GammaCorrectie instellen
    renderer.gammaOutput = true; // Verouderd in nieuwere Three.js versies, gebruik outputEncoding
    renderer.outputEncoding = THREE.sRGBEncoding; // Aanbevolen manier in nieuwere versies
    
    // Schaduw inschakelen
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Zachtere schaduwen
    
    
    // Nadat de renderer is gedefinieerd, voeg je het domElement toe aan de canvasContainer
    document.getElementById('canvasContainer').appendChild(renderer.domElement);
    document.getElementById('canvasContainer').style.display = 'block';

    //Voeg de container toe van alle beschikbare objecten bij start.
    createSelectObjectButtons(availableObjects);
    // Voeg de container toe met alle beschikbare materialen
    createMaterialButtons(kleurArray);
    
    function addEventListeners() {
        renderer.domElement.addEventListener('mousedown', onMouseDown, false);
        renderer.domElement.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('mouseup', onMouseUp, false);
        controls.enabled = true;
    }
    
    let dragPlane = new THREE.Plane();
    let dragOffset = new THREE.Vector3();
    
    function onMouseDown(event) {
        event.preventDefault();
        
        // Calculate mouse position in normalized device coordinates
        mouse.x = ((event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - renderer.domElement.offsetTop) / renderer.domElement.clientHeight) * 2 + 1;
    
        // Cast a ray from the camera through the mouse position
        raycaster.setFromCamera(mouse, camera);
    
        // Raycast only on switchable objects for better performance and precision
        let intersects = raycaster.intersectObjects(switchableObjects, true);
    
        if (intersects.length > 0) {
            let target = intersects[0].object;
    
            // Ensure we select the parent object if necessary
            while (target.parent) {
                if (switchableObjects.includes(target)) {
                    selectedObject = target;
                    break; 
                }
                target = target.parent;
            }
    
            if (selectedObject) {
                // If clicked the same object, just return to avoid reselecting
                if (isDragging) return;
    
                // Disable controls and start dragging
                controls.enabled = false;
                isDragging = true;
    
                // Set up a plane to drag the object on
                dragPlane.setFromNormalAndCoplanarPoint(
                    camera.getWorldDirection(dragPlane.normal),
                    selectedObject.position
                );
    
                // Calculate drag offset to ensure smooth movement
                if (raycaster.ray.intersectPlane(dragPlane, dragOffset)) {
                    dragOffset.sub(selectedObject.position);
                }
    
                // Update the bounding box if needed
                updateBoundingBox();

                function showMenu() {
                    document.getElementById("buttonContainer").style.display = "flex";
                }
                
                function hideMenu() {
                    document.getElementById("buttonContainer").style.display = "none";
                }
                
                // Controle of een object geselecteerd is
                if (selectedObject) {
                    // Toon het menu als er een object is geselecteerd
                    showMenu();
                } else {
                    // Verberg het menu als er geen object is geselecteerd
                    hideMenu();
                }
                
            }
        } else {
            // If no object is clicked, reset selectedObject and re-enable controls
            selectedObject = null;
            controls.enabled = true;
            removeBoundingBox();
            // Update the bounding box if needed
            updateBoundingBox();

            function hideMenu() {
                document.getElementById("buttonContainer").style.display = "none";
            }
            
                // Verberg het menu als er geen object is geselecteerd
                hideMenu();

            
        }
    }
    

  // Handle delete button click
  document.getElementById('deleteButton').addEventListener('click', function() {
    if (selectedObject) {
      // Remove the selected object from the scene
      scene.remove(selectedObject);
      selectedObject = null; // Reset selected object
    }
  });
  
  // Rendering loop
  function animate() {
    requestAnimationFrame(animate);
  
    renderer.render(scene, camera);
  }
    
    function onMouseMove(event) {
        if (!isDragging || !selectedObject) return;
        
        mouse.x = ((event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - renderer.domElement.offsetTop) / renderer.domElement.clientHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        let intersectPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(dragPlane, intersectPoint)) {
            let newPosition = intersectPoint.sub(dragOffset);
            // Behoud de oorspronkelijke z-positie
            newPosition.z = selectedObject.position.z;
            selectedObject.position.copy(newPosition);
            updateBoundingBox(); // Update de BoxHelper om het geselecteerde object
        }
    }
    
    function onMouseUp() {
        if (isDragging) {
            isDragging = false;
            controls.enabled = true;
        }
    }

    controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.05;

    // const PCDloader = new PCDLoader();
    // PCDloader.load('pcd/frame_00186.pcd', function (points) {
    //    scene.add(points);
    //    render();
    // });
    
    
    // Zorg ervoor dat je deze functieaanroep toevoegt binnen je init() functie
    addEventListeners();
    
    // Hier voeg je de belichting toe
    addLighting();
    
    // Maak een nieuw Image element voor de geüploade afbeelding
    loadImage(textureSrc)
    

    document.getElementById('canvasContainer').style.display = 'block';
    document.getElementById('canvasContainer').appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

// Function to load an object by name
export function loadSelectedObject(object_name) {
    const objExt = ".obj";
    const mtlExt = ".mtl";
    const basePath = "obj/";

    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();


    // MTL Loader
    mtlLoader.load(basePath + object_name + mtlExt, (materials) => {
        // OBJ model loading
        objLoader.setMaterials(materials);
        objLoader.load(basePath + object_name + objExt, function(object) {
            object.scale.setScalar(1);
            objModel = object;

            object.traverse(function(child) {
                if (child.isMesh && child.material) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    // For 'Doek' material
                    if (child.material.name === "Doek") {
                        // Use MeshStandardMaterial for a more realistic appearance
                        let stofTexture = new THREE.TextureLoader().load('obj/textures/doeken/doek1.png');
                        child.material = new THREE.MeshStandardMaterial({
                            name: "Doek",
                            map: stofTexture, // Texture for a fabric-like appearance
                            roughness: 0.9,
                            metalness: 0.1,
                        });
                    }

                    // For 'Bak' material
                    else if (child.material.name === "Bak") {
                        // Use MeshStandardMaterial for a more realistic appearance
                        let stofTexture = new THREE.TextureLoader().load('obj/textures/bak/bak1.png');
                        child.material = new THREE.MeshStandardMaterial({
                            name: "Bak",
                            map: stofTexture, // Texture for a fabric-like appearance
                            roughness: 0.9,
                            metalness: 0.1,
                        });
                    }

                    // For 'PVC' material
                    if (child.material.name === "PVC") {
                        let ijzerTexture = new THREE.TextureLoader().load('obj/metallic-textured-background.jpg');
                        child.material = new THREE.MeshStandardMaterial({
                            name: "PVC",
                            map: ijzerTexture, // Texture for a metal-like appearance
                            roughness: 0.9,
                            metalness: 0.1,
                        });
                    }
                    child.material.needsUpdate = true;
                }
            });

            // Set textures
            changeTexture(objModel, "Bak", "obj/textures/bak/bak1.png", true);
            changeTexture(objModel, "Doek", "obj/textures/doeken/doek2.png", true);

            // Add the new object to the scene
            scene.add(objModel);
            objModel.receiveShadow = true;
            objModel.position.x = 0;

            // Store the new object in switchableObjects
            switchableObjects.push(objModel);
        });
    });
}

//function to load the selected image
export function loadImage(textureSrc){
    const image = new Image();
    image.src = textureSrc; // Stel de data-URL in als de bron van de afbeelding
    image.onload = function() {
        // Wanneer de afbeelding geladen is, creëer dan de textuur
        const texture = new THREE.Texture(image);
        texture.needsUpdate = true; // Zorg ervoor dat Three.js weet dat de textuur geüpdatet moet worden
        
        // Verbeter de kwaliteit en helderheid van de foto
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        
        
        // Gebruik deze textuur voor je materiaal
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.0, // Aanpassen voor minder weerspiegeling
            metalness: 0.0  // Aanpassen voor minder metallic look

            });
        
        // Creëer de geometrie en mesh zoals gebruikelijk
        const geometry = new THREE.PlaneGeometry(15, 10);
        imagePlane = new THREE.Mesh(geometry, material);
        imagePlane.geometry.computeBoundingSphere();
        //const size = mesh.geometry.boundingBox.getSize();
        imagePlane.position.x = 0;
        imagePlane.receiveShadow = true; // Laat het afbeeldingsvlak schaduwen ontvangen
        scene.add(imagePlane);  

        //switchableObjects.push(imagePlane);
    };
}

export function checkForselectedObject() {
    if (selectedObject == null) {
        showTemporaryAlert("Je moet eerst een markies selecteren door erop te klikken.", 2000);
    }
}

function showTemporaryAlert(message, duration) {
    // Maak een modal div
    const alertBox = document.createElement("div");
    alertBox.textContent = message;
    alertBox.style.position = "fixed";
    alertBox.style.top = "20px";
    alertBox.style.left = "50%";
    alertBox.style.transform = "translateX(-50%)";
    alertBox.style.backgroundColor = "#f44336";
    alertBox.style.color = "#fff";
    alertBox.style.padding = "15px 30px";
    alertBox.style.borderRadius = "5px";
    alertBox.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    alertBox.style.zIndex = "1000";
    alertBox.style.fontSize = "16px";

    // Append the alert to the body
    document.body.appendChild(alertBox);

    // Verwijder de pop up na bepaalde tijd
    setTimeout(() => {
        alertBox.remove();
    }, duration);
    }

function addLighting() {
    // Ambient Light toevoegen
    const ambientLight = new THREE.AmbientLight(0xDDEEFF, 0.7);
    scene.add(ambientLight);
    lights.push(ambientLight);
        
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    lights.push(hemiLight);
    
    directionalLight = new THREE.DirectionalLight(0xFFF6E5, 1);
    directionalLight.position.set(5, 10, 5); // Aangepast voor een meer diagonale zonlichtinval
    directionalLight.castShadow = true; // Schaduwen werpen inschakelen
    scene.add(directionalLight);
    lights.push(directionalLight);
    
    // Schaduwkwaliteit verbeteren
    directionalLight.shadow.mapSize.width = 4096; // Hogere resolutie schaduwmap
    directionalLight.shadow.mapSize.height = 4096; // Hogere resolutie schaduwmap
    directionalLight.shadow.camera.near = 0.5; // Naderbij de near clip van de schaduwcamera
    directionalLight.shadow.camera.far = 500; // Verderaf de far clip van de schaduwcamera
    
    // Toon waar het licht vandaan komt
    const shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    //scene.add(shadowCameraHelper);
    
    // Meer lichtbronnen hier toevoegen volgens behoefte
    // Bijvoorbeeld PointLight, SpotLight, etc.
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

export function zoomIn(){
    camera.position.z *= 0.99; // Pas deze factor aan om de zoomsnelheid te wijzigen
    controls.update();
}

export function zoomOut(){
    camera.position.z /= 0.99; // Pas deze factor aan om de zoomsnelheid te wijzigen
    controls.update();
}

export function exportSceneAsImage() {
    console.log("Screenshotfunctie gestart");
    
    // Renderer uitlezen naar een Data URL
    var imgData;
    try {
        var strMime = "image/jpg";
        imgData = renderer.domElement.toDataURL(strMime);
        
        // Laad de screenshot in een nieuwe afbeelding om bewerking mogelijk te maken
        const img = new Image();
        img.onload = function() {
            console.log("Screenshot geladen in nieuwe afbeelding");

            const borderSize = 80; // Verhoogd om rand 4x zo dik te maken
            const canvasWidth = renderer.domElement.width + borderSize * 2;
            const canvasHeight = renderer.domElement.height + borderSize * 2;

            // Maak een nieuw canvas voor de afbeelding met rand en logo
            const offscreenCanvas = document.createElement("canvas");
            offscreenCanvas.width = canvasWidth;
            offscreenCanvas.height = canvasHeight;
            const ctx = offscreenCanvas.getContext("2d");

            // Teken zwarte rand als achtergrond
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // Teken de screenshot in het midden van het nieuwe canvas
            ctx.drawImage(img, borderSize, borderSize);

            // Laad en teken het logo op de rand (canvas) zelf
            const logo = new Image();
            logo.src = "img/logo-schlappi.png"; // Controleer het pad
            logo.onload = function() {
                console.log("Logo geladen en toegevoegd aan canvas");

                const logoWidth = 200; // Pas aan indien nodig
                const logoHeight = 50; // Pas aan indien nodig

                // Plaatsing van logo in de zwarte rand
                const logoX = canvasWidth - logoWidth - (borderSize / 2);
                const logoY = canvasHeight - logoHeight - (borderSize / 4);

                // Teken logo op de rand
                ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

                // Converteer het aangepaste canvas naar een afbeelding en download
                const finalImageData = offscreenCanvas.toDataURL("image/jpg");

                // Maak een link en klik er programmatisch op om de afbeelding te downloaden
                const link = document.createElement('a');
                if (typeof link.download === 'string') {
                    document.body.appendChild(link); // Firefox vereist dat de link deel uitmaakt van het document
                    link.download = 'scene_with_border.jpg';
                    link.href = finalImageData;
                    link.click();
                    document.body.removeChild(link); // Verwijder de link wanneer het niet meer nodig is
                    console.log("Screenshot gedownload met rand en logo");
                } else {
                    location.replace(finalImageData);
                }
            };
            logo.onerror = function() {
                console.error("Fout bij laden van logo. Controleer het pad naar het logo.");
            };
        };
        img.onerror = function() {
            console.error("Fout bij laden van screenshot afbeelding.");
        };
        img.src = imgData;
    } catch (e) {
        console.error("Er is een fout opgetreden:", e);
    }
}

// Selecteer de knoppen
const panningButton = document.getElementById('panningMode');
const threeDButton = document.getElementById('3dMode');

// Zet de 3D Mode knop standaard op actief (rood)
threeDButton.classList.add('active');
threeDButton.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';  // Maak de knop rood en semi-transparant

// Voeg een event listener toe voor de Panning Mode knop
panningButton.addEventListener('click', function() {
    const isActive = panningButton.classList.contains('active');

    if (isActive) {
        // Als de Panning Mode knop actief is, zet hem terug naar normale staat
        panningButton.classList.remove('active');
        panningButton.style.backgroundColor = '';  // Herstel originele achtergrondkleur
        enableOrbitControls(false);  // Zet panning uit
        // Zet de 3D Mode knop weer naar actief, aangezien Panning Mode uit is
        threeDButton.classList.add('active');
        threeDButton.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    } else {
        // Als de Panning Mode knop niet actief is, zet hem naar actieve staat
        panningButton.classList.add('active');
        panningButton.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';  // Maak de knop rood en transparant
        enableOrbitControls(true);  // Zet panning aan
        // Zet de 3D Mode knop uit
        threeDButton.classList.remove('active');
        threeDButton.style.backgroundColor = '';  // Herstel originele achtergrondkleur
    }
});

// Voeg een event listener toe voor de 3D Mode knop
threeDButton.addEventListener('click', function() {
    const isActive = threeDButton.classList.contains('active');

    if (isActive) {
        // Als de 3D Mode knop actief is, zet hem uit
        threeDButton.classList.remove('active');
        threeDButton.style.backgroundColor = '';  // Herstel originele achtergrondkleur
        // Zet de Panning Mode knop automatisch actief
        panningButton.classList.add('active');
        panningButton.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';  // Maak de knop rood en transparant
        enableOrbitControls(true);  // Zet panning aan
    } else {
        // Als de 3D Mode knop niet actief is, zet hem naar actieve staat
        threeDButton.classList.add('active');
        threeDButton.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';  // Maak de knop rood en semi-transparant
        // Zet de Panning Mode knop uit
        panningButton.classList.remove('active');
        panningButton.style.backgroundColor = '';  // Herstel originele achtergrondkleur
        enableOrbitControls(false);  // Zet panning uit
    }
});



// Deze functie schakelt panning mode in/uit zonder de Shift-toets
function enableOrbitControls(enablePanning) {
    if (controls) {
        // Zet de panning in/uit afhankelijk van de status van de knop
        controls.enablePan = enablePanning;
        controls.screenSpacePanning = enablePanning;  // Zorg ervoor dat panning mogelijk is in schermruimte
        
        // Zet roteren uit als panning aan staat
        controls.enableRotate = !enablePanning;

        // Maak panning mogelijk zonder Shift-toets door de event listeners aan te passen
        controls.mouseButtons = {
            LEFT: (enablePanning ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE),
            MIDDLE: THREE.MOUSE.PAN,  // Muiswiel kan ook panning triggeren
            RIGHT: THREE.MOUSE.ROTATE
        };

        // Extra optie voor pan snelheid aanpassen
        controls.keyPanSpeed = 7.0;  // Pas dit aan om de snelheid van panning te regelen
    }
}





// Function to copy the selected object. exported to buttonFunctions.js
export function copyObject() {
    checkForselectedObject();
    if (selectedObject) {
        clipboardObject = selectedObject.clone();
    }
}

// Function to paste the copied object
export function pasteObject() {
    checkForselectedObject();
    if (clipboardObject) {
        // Clone the object
        const objectClone = clipboardObject.clone();

        // Ensure the cloned object has a unique material
        objectClone.traverse((child) => {
            if (child.isMesh) {
                // Clone the material to ensure it's unique
                child.material = child.material.clone();
            }
        });

        // Add the cloned object to the scene and adjust position
        scene.add(objectClone);
        objectClone.position.x += 1; // Adjust position slightly

        // Add the cloned object to switchableObjects and make it the selected object
        switchableObjects.push(objectClone);
        selectedObject = objectClone;
        updateBoundingBox(); // Update the bounding box
    }
}

function updateBoundingBox() {
    // Verwijder de oude BoxHelper als deze bestaat
    if (boxHelper) {
        scene.remove(boxHelper);
        boxHelper = undefined;
    }
    
    // Controleer of er een geselecteerd object is
    if (selectedObject) {
        // Maak een nieuwe BoxHelper voor het geselecteerde object
        boxHelper = new THREE.BoxHelper(selectedObject, 0xffff00); // Geel als kleurvoorbeeld
        scene.add(boxHelper);
    }
}
export {updateBoundingBox};

function removeBoundingBox() {
    if (boxHelper) {
        // Maak de boxHelper onzichtbaar of verwijder deze
        scene.remove(boxHelper);
        boxHelper = null;
    }
}

export function changeLightDirection(direction) {
    let targetPosition = new THREE.Vector3(0, 0, 0); // Stel dit in op de positie van je focuspunt in de scene
    console.log(direction);
    switch(direction) {
        case 'Voor':
            directionalLight.position.set(0, 10, 10);
            break;
        case 'Links':
            directionalLight.position.set(5, 5, 5);
            break;
        case 'Rechts':
            directionalLight.position.set(-5, 5, 5);
            break;
    }
    directionalLight.target.position.copy(targetPosition); // Richt het licht
    directionalLight.target.updateMatrixWorld();
}
