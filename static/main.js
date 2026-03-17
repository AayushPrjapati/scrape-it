function toggleFullscreen(btn) {
    const card = btn.closest('.card');
    const group = btn.closest('.output-group');
    const isFullscreen = group.classList.toggle('fullscreen');
    
    // Toggle the 'has-fullscreen' class on the card itself
    card.classList.toggle('has-fullscreen', isFullscreen);
    
    // Add a class to the body to help hide other cards
    document.body.classList.toggle('fullscreen-active', isFullscreen);
    
    // Toggle icons
    const maximizeIcon = btn.querySelector('.maximize-icon');
    const minimizeIcon = btn.querySelector('.minimize-icon');
    
    if (maximizeIcon && minimizeIcon) {
        maximizeIcon.style.display = isFullscreen ? 'none' : 'block';
        minimizeIcon.style.display = isFullscreen ? 'block' : 'none';
    }
}

// Update your ExtractPerson (and similarly for Company)
async function ExtractPerson() {
    const btn = document.getElementById("scrape-person");
    const output = document.getElementById("person-output");
    const inputUrl = document.getElementById("person-url").value.trim();
    const person_url = inputUrl || "https://www.linkedin.com/in/aayush-prajapati501";

    // Auto-expand on extract if not already expanded
    const group = output.closest('.output-group');
    if (!group.classList.contains('fullscreen')) {
        const fullscreenBtn = group.querySelector('.fullscreen-btn');
        if (fullscreenBtn) toggleFullscreen(fullscreenBtn);
    }
    
    // Set extracting state
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Extracting...';
    btn.classList.add('loading');
    btn.disabled = true;
    output.value = "Extracting data, please wait...";

    try {
        const response = await fetch("https://api-d7b62b.stack.tryrelevance.com/latest/studios/f4a64b2f-6864-4ec0-bd48-6132d4877e21/trigger_webhook?project=99218675-2454-4d36-809b-a4b402b73d66", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "99218675-2454-4d36-809b-a4b402b73d66:sk-ZDBhYTVlN2QtYjZlNC00ZTdlLTkwM2EtZWM1NWE0NTZiZGNm"
            },
            body: JSON.stringify({ "linkedin_url": person_url })
        });
        
        const text = await response.json();
        
        if (text.answer) {
            output.value = text.answer;
        } else {
            // Handle valid response if 'answer' key isn't present
            output.value = JSON.stringify(text, null, 2);
        }
    } catch (error) {
        output.value = "Error during extraction: " + error.message;
    } finally {
        // Reset button state
        btn.innerHTML = originalText;
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}


document.getElementById("scrape-person").addEventListener("click", ExtractPerson);
