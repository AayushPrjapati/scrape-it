// Configuration for the different scrapers
const SCRAPER_CONFIG = {
    person: {
        endpoint: "https://api-d7b62b.stack.tryrelevance.com/latest/studios/f4a64b2f-6864-4ec0-bd48-6132d4877e21/trigger_webhook?project=99218675-2454-4d36-809b-a4b402b73d66",
        auth: "99218675-2454-4d36-809b-a4b402b73d66:sk-ZDBhYTVlN2QtYjZlNC00ZTdlLTkwM2EtZWM1NWE0NTZiZGNm",
        bodyKey: "linkedin_url"
    },
    company: {
        endpoint: "https://api-d7b62b.stack.tryrelevance.com/latest/studios/95bf952d-027e-4fdd-be62-f8ae9f2fdc03/trigger_webhook?project=99218675-2454-4d36-809b-a4b402b73d66",
        auth: "99218675-2454-4d36-809b-a4b402b73d66:sk-NTIzMTE5ZGYtNjcyNS00ZTA1LWFiYmYtNjA4ZmRlMTc2MGQw",
        bodyKey: "company_url"
    }
};

async function handleScrape(type) {
    const config = SCRAPER_CONFIG[type];
    const btn = document.getElementById(`scrape-${type}`);
    const input = document.getElementById(`${type}-url`);
    const output = document.getElementById(`${type}-output`);
    const urlValue = input.value.trim();

    if (!urlValue) {
        alert(`Please enter a valid URL for the ${type} profile.`);
        return;
    }

    // --- 1. UI Elongation Logic ---
    const group = output.closest('.output-group');
    if (!group.classList.contains('fullscreen')) {
        const fullscreenBtn = group.querySelector('.fullscreen-btn');
        if (fullscreenBtn) toggleFullscreen(fullscreenBtn);
    }

    // --- 2. Loading State ---
    const originalBtnContent = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Extracting...';
    btn.classList.add('loading');
    btn.disabled = true;
    output.value = `Initiating ${type} data extraction...`;

    try {
        // Build the dynamic body: { "linkedin_url": "..." } OR { "company_url": "..." }
        const requestBody = {};
        requestBody[config.bodyKey] = urlValue;

        const response = await fetch(config.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": config.auth
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        // --- 3. Display Results ---
        // Checks for 'answer' field first, otherwise dumps the whole JSON
        if (data.answer) {
            output.value = data.answer;
        } else if (data.company_information_answer) {
            output.value = data.company_information_answer;
        } else {
            output.value = JSON.stringify(data, null, 2);
        }

    } catch (error) {
        output.value = "Fatal Error: " + error.message;
    } finally {
        // --- 4. Reset UI ---
        btn.innerHTML = originalBtnContent;
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// --- Layout Management ---

function toggleFullscreen(btn) {
    const card = btn.closest('.card');
    const group = btn.closest('.output-group');
    const isFullscreen = group.classList.toggle('fullscreen');
    
    card.classList.toggle('has-fullscreen', isFullscreen);
    document.body.classList.toggle('fullscreen-active', isFullscreen);
    
    const maxIcon = btn.querySelector('.maximize-icon');
    const minIcon = btn.querySelector('.minimize-icon');
    
    if (isFullscreen) {
        if (maxIcon) maxIcon.style.display = 'none';
        if (minIcon) minIcon.style.display = 'block';
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        if (maxIcon) maxIcon.style.display = 'block';
        if (minIcon) minIcon.style.display = 'none';
    }
}

// --- Event Listeners ---

document.getElementById("scrape-person").addEventListener("click", () => handleScrape('person'));
document.getElementById("scrape-company").addEventListener("click", () => handleScrape('company'));

// Trigger on 'Enter' key inside inputs
['person-url', 'company-url'].forEach(id => {
    document.getElementById(id).addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const type = id.split('-')[0];
            handleScrape(type);
        }
    });
});