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
    // createMaterialButton(1, bakPath, bakButtonsContainer, false);
    // createMaterialButton(2, bakPath, bakButtonsContainer, false);
    // createMaterialButton(3, bakPath, bakButtonsContainer, false);
    // createMaterialButton(4, bakPath, bakButtonsContainer, false);

    // Maak doekvariaties aan in een dropdown
    // doekIndex, array met andere doeken variaties, container van het document, type textuur
    createMaterialDropdown(5, [1, 2, 3, 4], bakPath, bakButtonsContainer, true);
    createMaterialDropdown(23, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], doekPath, materialButtonsContainer);
    createMaterialDropdown(25, [11, 12, 13, 14], doekPath, materialButtonsContainer);
    createMaterialDropdown(24, [15, 16, 17, 18, 19, 20, 21, 22], doekPath, materialButtonsContainer);
}

// Keep track of the currently open dropdown
let currentlyOpenDropdown = null;

function createMaterialDropdown(doekIndex, options, imagePath, container, isBak = false) {
    const materialContainer = document.createElement('div');
    materialContainer.classList.add('materialContainer');
    materialContainer.style.position = 'relative'; // Ensure dropdown is positioned relative to the container

    const button = document.createElement('button');
    button.classList.add('materialButton');

    // Maak een afbeeldings element voor de knop (gebruik makend van doekIndex)
    const img = document.createElement('img');
    let toChange = null;
    if (!isBak) {
        img.src = imagePath + `doek${doekIndex}.png`;
        toChange = "Doek";
    } else {
        img.src = imagePath + `bak${doekIndex}.png`;
        toChange = 'Bak';
    }
    button.appendChild(img);
    materialContainer.appendChild(button);

    // Maak een dropdown container en voeg deze toe aan de materialContainer
    const dropdown = document.createElement('div');
    dropdown.classList.add('materialDropdown');
    dropdown.style.display = 'none'; // In eerste instantie verborgen

    let dropDownContainer = null;
    if(!isBak){dropDownContainer = document.getElementById("dropDownContainer").appendChild(dropdown);} else {dropDownContainer = document.getElementById("dropDownContainer2").appendChild(dropdown);}

    // Voeg opties toe aan de dropdown
    options.forEach(option => {
        let optionPath = isBak ? `${imagePath}bak${option}.png` : `${imagePath}doek${option}.png`;
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('materialBox');

        // Maak een preview afbeelding
        const previewImage = createPreviewImage(optionPath);
        optionDiv.appendChild(previewImage);

        // Event listener voor textuurverandering
        optionDiv.addEventListener('click', () => {
            changeTexture(selectedObject, toChange, optionPath);
            dropdown.style.display = 'none'; // Verberg de dropdown na selectie
            currentlyOpenDropdown = null;   // Reset de huidige geopende dropdown
        });

        // Voeg de opties toe aan het dropdown-element
        dropdown.appendChild(optionDiv);
    });

    // Gebruik event listener voor de knop om de dropdown in te schakelen
    button.addEventListener('click', (event) => {
        event.stopPropagation(); // Voorkom dat het event naar de document click listener bubbelt

        // Sluit de huidige geopende dropdown als deze niet hetzelfde is als de huidige
        if (currentlyOpenDropdown && currentlyOpenDropdown !== dropdown) {
            currentlyOpenDropdown.style.display = 'none';
        }

        // Wissel de zichtbaarheid van de huidige dropdown
        const isVisible = dropdown.style.display === 'grid';
        dropdown.style.display = isVisible ? 'none' : 'grid';

        // Stel de huidige geopende dropdown in of maak deze leeg
        currentlyOpenDropdown = dropdown.style.display === 'grid' ? dropdown : null;
    });

    // Voeg een click event listener toe aan de materialContainer zelf
    materialContainer.addEventListener('click', (event) => {
        event.stopPropagation(); // Voorkom sluiten bij klikken op de materialContainer
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
