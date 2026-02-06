console.log('Players page loaded');

let allPlayers = [];
let allMatches = [];
let selectedSeason = 'all';

// Bereken seizoen op basis van datum (augustus-juli)
function getSeasonFromDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // 1-12
    const year = date.getFullYear();
    
    const seasonStartYear = month >= 8 ? year : year - 1;
    const seasonEndYear = seasonStartYear + 1;
    return `${seasonStartYear}-${seasonEndYear}`;
}

// Laad alle spelers
async function loadPlayers() {
    try {
        const [playersResponse, matchesResponse] = await Promise.all([
            fetch('/api/players'),
            fetch('/api/matches')
        ]);
        
        allPlayers = await playersResponse.json();
        allMatches = await matchesResponse.json();
        
        // Haal unieke seizoenen op en vul de dropdown
        const seasons = [...new Set(allMatches.map(m => m.season || getSeasonFromDate(m.date)))];
        seasons.sort().reverse(); // Nieuwste seizoen eerst
        
        const seasonFilter = document.getElementById('season-filter');
        seasonFilter.innerHTML = '<option value="all">Alle seizoenen</option>';
        seasons.forEach(season => {
            const option = document.createElement('option');
            option.value = season;
            option.textContent = `Seizoen ${season}`;
            seasonFilter.appendChild(option);
        });
        
        // Zet filter handler
        seasonFilter.addEventListener('change', (e) => {
            selectedSeason = e.target.value;
            displayPlayers();
        });
        
        displayPlayers();
    } catch (error) {
        console.error('Error loading players:', error);
        const tbody = document.getElementById('players-tbody');
        tbody.innerHTML = '<tr><td colspan="5">Fout bij het laden van spelers</td></tr>';
    }
}

function displayPlayers() {
    const tbody = document.getElementById('players-tbody');
    tbody.innerHTML = '';
    
    if (allPlayers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Geen spelers gevonden</td></tr>';
        return;
    }
    
    // Filter wedstrijden op seizoen en zonder evenementen
    let filteredMatches = allMatches.filter(match => !match.isEvent);
    if (selectedSeason !== 'all') {
        filteredMatches = filteredMatches.filter(match => 
            (match.season || getSeasonFromDate(match.date)) === selectedSeason
        );
    }
    
    // Tel alleen gespeelde wedstrijden (in het verleden)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const playedMatches = filteredMatches.filter(match => new Date(match.date) < today);
    const totalPlayedMatches = playedMatches.length;
    
    // Sorteer spelers alfabetisch op naam
    allPlayers.sort((a, b) => a.name.localeCompare(b.name));
    
    allPlayers.forEach(player => {
        // Tel het aantal wedstrijden waarin deze speler heeft gespeeld
        const playerMatches = playedMatches.filter(match => 
            match.lineup && match.lineup.includes(player.id)
        ).length;
        
        // Bereken aanwezigheidspercentage
        const attendancePercentage = totalPlayedMatches > 0 
            ? Math.round((playerMatches / totalPlayedMatches) * 100) 
            : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Naam">${player.name}</td>
            <td data-label="Wedstrijden Gespeeld">${playerMatches}</td>
            <td data-label="Totaal Wedstrijden">${totalPlayedMatches}</td>
            <td data-label="Aanwezigheid"><strong>${attendancePercentage}%</strong></td>
            <td data-label="Acties">
                <button onclick="deletePlayer(${player.id})" class="btn-delete">Verwijderen</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Voeg speler toe
document.addEventListener('DOMContentLoaded', () => {
    loadPlayers();
    
    const form = document.getElementById('player-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const playerData = {
            name: document.getElementById('player-name').value,
            position: 'Speler',
            jerseyNumber: 0
        };
        
        try {
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playerData)
            });
            
            if (response.ok) {
                form.reset();
                loadPlayers();
                alert('Speler succesvol toegevoegd!');
            } else {
                alert('Fout bij toevoegen speler');
            }
        } catch (error) {
            console.error('Error adding player:', error);
            alert('Fout bij toevoegen speler');
        }
    });
});

// Verwijder speler
async function deletePlayer(id) {
    if (!confirm('Weet je zeker dat je deze speler wilt verwijderen?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/players/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadPlayers();
            alert('Speler verwijderd!');
        } else {
            alert('Fout bij verwijderen speler');
        }
    } catch (error) {
        console.error('Error deleting player:', error);
        alert('Fout bij verwijderen speler');
    }
}
