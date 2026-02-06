console.log('Season overview page loaded');

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

// Laad seizoen statistieken
function loadSeasonStats() {
    fetch('/api/matches')
        .then(response => response.json())
        .then(matches => {
            allMatches = matches;
            
            // Haal unieke seizoenen op en vul de dropdown
            const seasons = [...new Set(matches.map(m => m.season || getSeasonFromDate(m.date)))];
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
                displayStats();
            });
            
            displayStats();
        })
        .catch(error => {
            console.error('Error loading season stats:', error);
        });
}

function displayStats() {
    // Filter alleen wedstrijden (geen evenementen)
    let filteredMatches = allMatches.filter(match => !match.isEvent);
    
    // Filter op seizoen
    if (selectedSeason !== 'all') {
        filteredMatches = filteredMatches.filter(match => 
            (match.season || getSeasonFromDate(match.date)) === selectedSeason
        );
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Tel alleen gespeelde wedstrijden (in het verleden)
    const playedMatches = filteredMatches.filter(match => new Date(match.date) < today);
    
    const totalMatches = filteredMatches.length;
    const playedCount = playedMatches.length;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    
    playedMatches.forEach(match => {
        if (match.homeScore > match.awayScore) {
            wins++;
        } else if (match.homeScore === match.awayScore) {
            draws++;
        } else {
            losses++;
        }
    });
    
    document.getElementById('total-matches').textContent = totalMatches;
    document.getElementById('played-matches').textContent = playedCount;
    document.getElementById('total-wins').textContent = wins;
    document.getElementById('total-draws').textContent = draws;
    document.getElementById('total-losses').textContent = losses;
    
    // Laad wedstrijden tabel (alleen gespeelde wedstrijden)
    loadMatchesTable(playedMatches);
}

// Laad wedstrijden tabel
function loadMatchesTable(matches) {
    const tbody = document.getElementById('overview-matches-tbody');
    tbody.innerHTML = '';
    
    if (matches.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Geen wedstrijden gespeeld</td></tr>';
        return;
    }
    
    // Sorteer wedstrijden op datum (nieuwste eerst)
    matches.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    matches.forEach(match => {
        let result = '';
        let resultClass = '';
        
        if (match.homeScore > match.awayScore) {
            result = 'Gewonnen';
            resultClass = 'win';
        } else if (match.homeScore === match.awayScore) {
            result = 'Gelijkspel';
            resultClass = 'draw';
        } else {
            result = 'Verloren';
            resultClass = 'loss';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Datum">${match.date}</td>
            <td data-label="Tegenstander">${match.opponent}</td>
            <td data-label="Score">${match.homeScore} - ${match.awayScore}</td>
            <td data-label="Resultaat" class="${resultClass}">${result}</td>
        `;
        tbody.appendChild(row);
    });
}

// Laad alles wanneer pagina geladen is
document.addEventListener('DOMContentLoaded', () => {
    loadSeasonStats();
});
