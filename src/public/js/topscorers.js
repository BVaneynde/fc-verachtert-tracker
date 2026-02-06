console.log('Topscorers page loaded');

let allMatches = [];
let allPlayers = [];
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

async function loadTopscorers() {
    try {
        // Haal alle matches en spelers op
        const [matchesResponse, playersResponse] = await Promise.all([
            fetch('/api/matches'),
            fetch('/api/players')
        ]);
        
        allMatches = await matchesResponse.json();
        allPlayers = await playersResponse.json();
        
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
            displayTopscorers();
        });
        
        displayTopscorers();
    } catch (error) {
        console.error('Error loading topscorers:', error);
        const tbody = document.getElementById('scorers-tbody');
        tbody.innerHTML = '<tr><td colspan="5">Fout bij laden van topscorers</td></tr>';
    }
}

function displayTopscorers() {
    // Filter wedstrijden op seizoen en zonder evenementen
    let filteredMatches = allMatches.filter(match => !match.isEvent);
    if (selectedSeason !== 'all') {
        filteredMatches = filteredMatches.filter(match => 
            (match.season || getSeasonFromDate(match.date)) === selectedSeason
        );
    }
    
    // Maak een map van speler statistieken
    const scorerStats = new Map();
    
    // Initialiseer alle spelers met 0 goals
    allPlayers.forEach(player => {
        scorerStats.set(player.id, {
            playerId: player.id,
            name: player.name,
            goals: 0,
            matches: 0
        });
    });
    
    // Tel doelpunten en wedstrijden per speler
    filteredMatches.forEach(match => {
        // Tel doelpunten
        if (match.scorers && match.scorers.length > 0) {
            match.scorers.forEach(scorer => {
                const stats = scorerStats.get(scorer.playerId);
                if (stats) {
                    stats.goals += scorer.goals;
                }
            });
        }
        
        // Tel wedstrijden
        if (match.lineup && match.lineup.length > 0) {
            match.lineup.forEach(playerId => {
                const stats = scorerStats.get(playerId);
                if (stats) {
                    stats.matches++;
                }
            });
        }
    });
    
    // Converteer naar array en sorteer op doelpunten
    const scorersArray = Array.from(scorerStats.values())
        .filter(s => s.goals > 0 || s.matches > 0)  // Toon alleen spelers met activiteit
        .sort((a, b) => {
            // Sorteer eerst op doelpunten, dan op wedstrijden
            if (b.goals !== a.goals) return b.goals - a.goals;
            return b.matches - a.matches;
        });
    
    // Bereken totalen
    const totalGoals = scorersArray.reduce((sum, s) => sum + s.goals, 0);
    const totalScorers = scorersArray.filter(s => s.goals > 0).length;
    
    document.getElementById('total-goals').textContent = totalGoals;
    document.getElementById('total-scorers').textContent = totalScorers;
    
    // Toon rangschikking
    const tbody = document.getElementById('scorers-tbody');
    tbody.innerHTML = '';
    
    if (scorersArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Nog geen doelpuntenmakers</td></tr>';
        return;
    }
    
    scorersArray.forEach((scorer, index) => {
        const average = scorer.matches > 0 ? (scorer.goals / scorer.matches).toFixed(2) : '0.00';
        const rank = index + 1;
        
        // Highlight top 3
        let rankClass = '';
        if (rank === 1) rankClass = 'rank-gold';
        else if (rank === 2) rankClass = 'rank-silver';
        else if (rank === 3) rankClass = 'rank-bronze';
        
        const row = document.createElement('tr');
        row.className = rankClass;
        row.innerHTML = `
            <td data-label="Rang" class="rank">${rank}</td>
            <td data-label="Naam">${scorer.name}</td>
            <td data-label="Doelpunten" class="goals-cell">${scorer.goals}</td>
            <td data-label="Wedstrijden">${scorer.matches}</td>
            <td data-label="Gemiddelde">${average}</td>
        `;
        tbody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadTopscorers();
});
