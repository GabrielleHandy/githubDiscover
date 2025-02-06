let repoList = [];
let filteredRepoList = [];
let currentRepoIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('https://raw.githubusercontent.com/kamranahmedse/githunt/master/src/components/filters/language-filter/languages.json');
    const languages = await response.json();
    const languageSelect = document.getElementById('languageSelect');

    // Populate the dropdown with languages
    Object.keys(languages).forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = language;
        languageSelect.appendChild(option);
    });

    document.getElementById('fetchRepoBtn').addEventListener('click', ()=>{repoList = []; fetchRandomRepo();});
    document.getElementById('refreshBtn').addEventListener('click', fetchRandomRepo);
    document.getElementById('minStars').addEventListener('input', validateStars);
    document.getElementById('maxStars').addEventListener('input', validateStars);
});

async function fetchRandomRepo() {
    const language = document.getElementById('languageSelect').value;
    const minStars = parseInt(document.getElementById('minStars').value) || 0;
    const maxStars = parseInt(document.getElementById('maxStars').value) || 100000;
    const openSource = document.getElementById('openSource').checked;
    const topics = document.getElementById('topics').value.split(',').map(topic => topic.trim()).filter(topic => topic);
    const loadingSpinner = document.getElementById('loadingSpinner');
    const repoDetailsContainer = document.getElementById('repoDetailsContainer');
    const repoDetails = document.getElementById('repoDetails');
    const refreshBtn = document.getElementById('refreshBtn');

    // Show loading spinner and hide repo details
    loadingSpinner.classList.remove('hidden');
    repoDetailsContainer.classList.add('hidden');
    repoDetails.innerHTML = '';

    try {
        if (repoList.length === 0) {
            let query = `stars:${minStars}..${maxStars}`;
            if (language) {
                query += `+language:${language}`;
            }
            if (openSource) {
                query += '+is:public';
            }
            if (topics.length > 0) {
                query += `+topic:${topics.join('+topic:')}`;
            }
            const response = await fetch(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc`);
            const data = await response.json();
            if (data.items.length === 0) {
                throw new Error('No repositories found.');
            }
            repoList = data.items;
            filterRepos();
        }

        const randomRepo = filteredRepoList[currentRepoIndex];
        currentRepoIndex = (currentRepoIndex + 1) % filteredRepoList.length;

        // Display repository details
        repoDetails.innerHTML = `
            <div class="repo-card">
                <h2><a href="${randomRepo.html_url}" target="_blank">${randomRepo.name}</a></h2>
                <p>${randomRepo.description}</p>
                <p><strong>⭐ Stars:</strong> ${randomRepo.stargazers_count}</p>
                <p><strong>🍴 Forks:</strong> ${randomRepo.forks_count}</p>
                <p><strong>🐛 Open Issues:</strong> ${randomRepo.open_issues_count}</p>
                <p><strong>👤 Owner:</strong> <a href="${randomRepo.owner.html_url}" target="_blank">${randomRepo.owner.login}</a></p>
                <p><strong>📅 Last Updated:</strong> ${new Date(randomRepo.updated_at).toLocaleDateString()}</p>
            </div>
        `;

        // Show repo details and refresh button
        repoDetailsContainer.classList.remove('hidden');
        refreshBtn.classList.remove('hidden');
    } catch (error) {
        repoDetails.innerHTML = `<p>Error: ${error.message}. Please try again.</p>`;
        repoDetailsContainer.classList.remove('hidden');
    } finally {
        // Hide loading spinner
        loadingSpinner.classList.add('hidden');
    }
}

function validateStars() {
    const minStarsInput = document.getElementById('minStars');
    const maxStarsInput = document.getElementById('maxStars');
    const minStars = parseInt(minStarsInput.value) || 0;
    const maxStars = parseInt(maxStarsInput.value) || 0;

    if (maxStars <= minStars) {
        maxStarsInput.value = minStars + 1;
    }

    filterRepos();
}

function filterRepos() {
    const minStars = parseInt(document.getElementById('minStars').value) || 0;
    const maxStars = parseInt(document.getElementById('maxStars').value) || 100000;

    filteredRepoList = repoList.filter(repo => repo.stargazers_count >= minStars && repo.stargazers_count <= maxStars);
    currentRepoIndex = 0;

    if (filteredRepoList.length === 0) {
        document.getElementById('repoDetails').innerHTML = '<p>No repositories match the filter criteria.</p>';
        document.getElementById('repoDetailsContainer').classList.remove('hidden');
    }
}

// Dark Mode Toggle
document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});