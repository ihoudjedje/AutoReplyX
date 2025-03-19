// Saves options to chrome.storage
function saveOptions() {
    const apiKey = document.getElementById('apiKey').value;

    chrome.storage.sync.set(
        { openaiApiKey: apiKey },
        function () {
            // Update status to let user know options were saved
            const status = document.getElementById('status');
            status.textContent = 'Options saved!';
            status.className = 'status success';
            status.style.display = 'block';

            setTimeout(function () {
                status.style.display = 'none';
            }, 3000);
        }
    );
}

// Restores options from chrome.storage
function restoreOptions() {
    chrome.storage.sync.get(
        { openaiApiKey: '' },
        function (items) {
            document.getElementById('apiKey').value = items.openaiApiKey;
        }
    );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions); 