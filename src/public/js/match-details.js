console.log('Match details page loaded');

let currentMatch = null;
let allPlayers = [];

// Haal match ID uit URL
function getMatchId() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id'));
}

// Laad match details
async function loadMatchDetails() {
    const matchId = getMatchId();
    if (!matchId) {
        alert('Geen wedstrijd ID gevonden');
        window.location.href = '/matches.html';
        return;
    }

    try {
        const response = await fetch(`/api/matches/${matchId}`);
        currentMatch = await response.json();
        
        document.getElementById('match-title').textContent = 
            `FC Verachtert vs ${currentMatch.opponent}`;
        document.getElementById('match-date').textContent = 
            `${currentMatch.date} - ${currentMatch.isHomeGame ? 'Thuis' : 'Uit'}`;
        
        // Vul scores in
        document.getElementById('home-score').value = currentMatch.homeScore;
        document.getElementById('away-score').value = currentMatch.awayScore;
        
        // Vul notities in
        document.getElementById('match-notes').value = currentMatch.notes || '';
        
        // Laad doelpuntenmakers
        displayScorers();
        
        // Laad spelers
        await loadPlayers();
        
        // Toon opstelling
        displayLineup();
        
    } catch (error) {
        console.error('Error loading match:', error);
        alert('Fout bij het laden van wedstrijd');
    }
}

// Laad alle spelers
async function loadPlayers() {
    try {
        const response = await fetch('/api/players');
        allPlayers = await response.json();
        
        // Vul speler dropdown voor doelpuntenmakers
        const scorerSelect = document.getElementById('scorer-player');
        scorerSelect.innerHTML = '<option value="">Selecteer speler</option>';
        allPlayers.forEach(player => {
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = `${player.jerseyNumber}. ${player.name}`;
            scorerSelect.appendChild(option);
        });
        
        // Maak checkboxes voor opstelling
        const checkboxContainer = document.getElementById('player-checkboxes');
        checkboxContainer.innerHTML = '';
        allPlayers.forEach(player => {
            const div = document.createElement('div');
            div.className = 'player-checkbox';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `player-${player.id}`;
            checkbox.value = player.id;
            
            // Check if player was in lineup
            if (currentMatch.lineup && currentMatch.lineup.includes(player.id)) {
                checkbox.checked = true;
            }
            
            const label = document.createElement('label');
            label.htmlFor = `player-${player.id}`;
            label.textContent = `${player.jerseyNumber}. ${player.name}`;
            
            div.appendChild(checkbox);
            div.appendChild(label);
            checkboxContainer.appendChild(div);
        });
        
    } catch (error) {
        console.error('Error loading players:', error);
    }
}

// Toon doelpuntenmakers
function displayScorers() {
    const scorersList = document.getElementById('scorers-list');
    scorersList.innerHTML = '';
    
    if (!currentMatch.scorers || currentMatch.scorers.length === 0) {
        scorersList.innerHTML = '<p>Nog geen doelpuntenmakers toegevoegd</p>';
        return;
    }
    
    currentMatch.scorers.forEach((scorer, index) => {
        const div = document.createElement('div');
        div.className = 'scorer-item';
        div.innerHTML = `
            <span>${scorer.playerName || 'Speler #' + scorer.playerId}: ${scorer.goals} doelpunt(en)</span>
            <button onclick="removeScorer(${index})" class="btn-delete">Verwijder</button>
        `;
        scorersList.appendChild(div);
    });
}

// Toon opstelling
function displayLineup() {
    // Al geregeld in loadPlayers via checkboxes
}

// Update score
document.getElementById('score-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const homeScore = parseInt(document.getElementById('home-score').value);
    const awayScore = parseInt(document.getElementById('away-score').value);
    
    try {
        const response = await fetch(`/api/matches/${currentMatch.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...currentMatch,
                homeScore,
                awayScore
            })
        });
        
        currentMatch = await response.json();
        alert('Score opgeslagen!');
        
    } catch (error) {
        console.error('Error saving score:', error);
        alert('Fout bij opslaan score');
    }
});

// Voeg doelpuntenmaker toe
document.getElementById('scorer-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const playerId = parseInt(document.getElementById('scorer-player').value);
    const goals = parseInt(document.getElementById('scorer-goals').value);
    
    if (!playerId) {
        alert('Selecteer een speler');
        return;
    }
    
    const player = allPlayers.find(p => p.id === playerId);
    
    // Voeg toe aan scorers array
    if (!currentMatch.scorers) {
        currentMatch.scorers = [];
    }
    
    // Check of speler al in lijst staat
    const existingScorer = currentMatch.scorers.find(s => s.playerId === playerId);
    if (existingScorer) {
        existingScorer.goals += goals;
    } else {
        currentMatch.scorers.push({
            playerId: playerId,
            playerName: player.name,
            goals: goals
        });
    }
    
    // Update match
    try {
        const response = await fetch(`/api/matches/${currentMatch.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentMatch)
        });
        
        currentMatch = await response.json();
        displayScorers();
        document.getElementById('scorer-form').reset();
        alert('Doelpuntenmaker toegevoegd!');
        
    } catch (error) {
        console.error('Error adding scorer:', error);
        alert('Fout bij toevoegen doelpuntenmaker');
    }
});

// Verwijder doelpuntenmaker
async function removeScorer(index) {
    if (!confirm('Weet je zeker dat je deze doelpuntenmaker wilt verwijderen?')) {
        return;
    }
    
    currentMatch.scorers.splice(index, 1);
    
    try {
        const response = await fetch(`/api/matches/${currentMatch.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentMatch)
        });
        
        currentMatch = await response.json();
        displayScorers();
        
    } catch (error) {
        console.error('Error removing scorer:', error);
        alert('Fout bij verwijderen doelpuntenmaker');
    }
}

// Sla opstelling op
document.getElementById('save-lineup').addEventListener('click', async () => {
    const checkboxes = document.querySelectorAll('#player-checkboxes input[type="checkbox"]');
    const lineup = [];
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            lineup.push(parseInt(checkbox.value));
        }
    });
    
    try {
        const response = await fetch(`/api/matches/${currentMatch.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...currentMatch,
                lineup: lineup
            })
        });
        
        currentMatch = await response.json();
        alert(`Opstelling opgeslagen! ${lineup.length} spelers geselecteerd.`);
        
    } catch (error) {
        console.error('Error saving lineup:', error);
        alert('Fout bij opslaan opstelling');
    }
});

// Sla notities op
document.getElementById('notes-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const notes = document.getElementById('match-notes').value;
    
    try {
        const response = await fetch(`/api/matches/${currentMatch.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...currentMatch,
                notes: notes
            })
        });
        
        currentMatch = await response.json();
        alert('Notities opgeslagen!');
        
    } catch (error) {
        console.error('Error saving notes:', error);
        alert('Fout bij opslaan notities');
    }
});

// Initialiseer bij laden
document.addEventListener('DOMContentLoaded', () => {
    loadMatchDetails();
});
