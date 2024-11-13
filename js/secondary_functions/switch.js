// Function to initialize the switch controls
function setupSwitchControls() {
    const switch1 = document.getElementById('switch1');
    const switch2 = document.getElementById('switch2');

    // Event listeners for the switches
    switch1.addEventListener('change', updateContainerVisibility);
    switch2.addEventListener('change', updateContainerVisibility);
    
    // Initialize the visibility of containers based on the default states of the switches
    updateContainerVisibility();
}

// Function to update the visibility of containers based on switch states
function updateContainerVisibility() {
    const switch1 = document.getElementById('switch1');
    const switch2 = document.getElementById('switch2');

    // Get the current state of both switches (0 or 1)
    const state1 = switch1.checked ? 1 : 0;
    const state2 = switch2.checked ? 1 : 0;

    // Combine the two states into a binary string
    const combinedState = `${state1}${state2}`;

    // Hide all containers initially
    document.getElementById('normalContainer').style.display = 'none';
    document.getElementById('nobakContainer').style.display = 'none';
    document.getElementById('straightContainer').style.display = 'none';
    document.getElementById('straightnbContainer').style.display = 'none';

    // Control the visibility based on the combined state of the switches
    switch (combinedState) {
        case '11':
            // Only 'normalContainer' visible
            document.getElementById('normalContainer').style.display = 'grid';
            break;
        case '10':
            // Only 'straightContainer' visible
            document.getElementById('straightContainer').style.display = 'grid';
            break;
        case '01':
            // Only 'nobakContainer' visible
            document.getElementById('nobakContainer').style.display = 'grid';
            break;
        case '00':
            // Only 'straightnbContainer' visible
            document.getElementById('straightnbContainer').style.display = 'grid';
            break;
        default:
            // Default case if no matching state
            break;
    }
}

// Call the setup function when the page loads
document.addEventListener('DOMContentLoaded', setupSwitchControls);
