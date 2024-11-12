import { selectedObject } from "../app.js";
import { changeTexture } from "./changeTexture.js";

// Functie om knoppen te maken voor elk materiaal en kleurvariatie dropdown toe te voegen
export function createMaterialButtons() {
    let materialButtonsContainer = document.getElementById('materialButtonsContainer');
    let bakButtonsContainer = document.getElementById('bakButtonsContainer');
    materialButtonsContainer.innerHTML = ''; // Wis alle bestaande knoppen
    let doekPath = 'obj/textures/doeken/';
    let bakPath = 'obj/textures/bak/';
    // Maak materiaal knop. false voor bak, true voor doek
    // nummer staat voor nummer in de png. Dit geval bak1.png t/m bak4.png bij true is het voor doek{}.png
    createMaterialButton(1, bakPath, bakButtonsContainer, false);
    createMaterialButton(2, bakPath, bakButtonsContainer, false);
    createMaterialButton(3, bakPath, bakButtonsContainer, false);
    createMaterialButton(4, bakPath, bakButtonsContainer, false);

    // Maak doekvariaties aan in een dropdown
    // doekIndex, array met andere doeken variaties, container van het document, type textuur
    createMaterialDropdown(1, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], doekPath, materialButtonsContainer);
    createMaterialDropdown(11, [11, 12, 13, 14], doekPath, materialButtonsContainer);
    createMaterialDropdown(15, [15, 16, 17, 18, 19, 20, 21, 22], doekPath, materialButtonsContainer);
}

// Algemene functie om een materiaal knop te maken
function createMaterialButton(index, imagePath, container, doek) {
    const materialContainer = document.createElement('div');
    if (doek){
        materialContainer.classList.add('materialContainer');
    }else{
        materialContainer.classList.add('bakContainer');
    }

    const button = document.createElement('button');
    button.classList.add('materialButton');

    const img = document.createElement('img');
    let optionPath;
    if (doek){
        optionPath = imagePath + `doek${index}.png`; 
    }
    else{
        optionPath = imagePath + `bak${index}.png`;
    }
    img.src = optionPath; // Gebruik index voor de basis textuur afbeelding
    button.appendChild(img);
    materialContainer.appendChild(button);

    // Eventlistener voor textuurverandering
    button.addEventListener('click', () => {
        if (doek){
            changeTexture(selectedObject, "Doek", optionPath); 
        }
        else{
            changeTexture(selectedObject, "Bak", optionPath)
        }
    });

    container.appendChild(materialContainer);
}

// Keep track of the currently open dropdown
let currentlyOpenDropdown = null;

function createMaterialDropdown(doekIndex, options, imagePath, container) {
    const materialContainer = document.createElement('div');
    materialContainer.classList.add('materialContainer');

    const button = document.createElement('button');
    button.classList.add('materialButton');

    // Maak een afbeeldings element voor de knop (gebruik makend van doekIndex)
    const img = document.createElement('img');
    img.src = imagePath + `doek${doekIndex}.png`; // Basis textuur afbeelding
    button.appendChild(img);
    materialContainer.appendChild(button);

    // Maak een dropdown container
    const dropdown = document.createElement('div');
    dropdown.classList.add('materialDropdown');
    dropdown.style.display = 'none'; // In eerste instantie verborgen
    materialContainer.appendChild(dropdown);

    // Add options to the dropdown
    options.forEach(option => {
        let optionPath = imagePath + `doek${option}.png`;
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('materialBox');

        // Maak een preview afbeelding
        const previewImage = createPreviewImage(optionPath);
        optionDiv.appendChild(previewImage);

        // Event listener om textuurverandering
        optionDiv.addEventListener('click', () => {
            changeTexture(selectedObject, 'Doek', optionPath);
            dropdown.style.display = 'none'; // Verberg de dropdown na selectie
            currentlyOpenDropdown = null; // Reset the currently open dropdown
        });

        dropdown.appendChild(optionDiv);
    });

    // Gebruik specifieke event listeners voor de knop zelf
    button.addEventListener('click', (event) => {
        // Stop bubbling to prevent unintended closures
        event.stopPropagation();

        // Close any currently open dropdown if it's not the same as this one
        if (currentlyOpenDropdown && currentlyOpenDropdown !== dropdown) {
            currentlyOpenDropdown.style.display = 'none';
        }

        // Toggle current dropdown visibility
        const isVisible = dropdown.style.display === 'flex';
        dropdown.style.display = isVisible ? 'none' : 'flex';

        // Set or clear the currently open dropdown
        currentlyOpenDropdown = dropdown.style.display === 'flex' ? dropdown : null;
    });

    // Add click event listener to the document to close the dropdown when clicked outside
    document.addEventListener('click', (event) => {
        if (currentlyOpenDropdown && !materialContainer.contains(event.target)) {
            currentlyOpenDropdown.style.display = 'none';
            currentlyOpenDropdown = null;
        }
    });

    container.appendChild(materialContainer);
}



// Functie om een preview afbeelding te maken. Dit zet de kleur over het materiaal heen in preview.
function createPreviewImage(texturePath, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 200; 
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = texturePath;

    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Als er een kleur is opgegeven, zet deze bovenop de texture
        if (color) {
            ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
            ctx.globalCompositeOperation = 'multiply'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    return canvas;
}
