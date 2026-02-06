console.log('Matches page loaded');

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

// Laad alle wedstrijden
function loadMatches() {
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
                displayMatches();
            });
            
            displayMatches();
        })
        .catch(error => {
            console.error('Error loading matches:', error);
            const tbody = document.getElementById('matches-tbody');
            tbody.innerHTML = '<tr><td colspan="5">Fout bij het laden van wedstrijden</td></tr>';
        });
}

function displayMatches() {
    const tbody = document.getElementById('matches-tbody');
    tbody.innerHTML = '';
    
    // Toon ALLE items (zowel wedstrijden als evenementen)
    let filteredMatches = allMatches;
    
    // Filter op seizoen
    if (selectedSeason !== 'all') {
        filteredMatches = filteredMatches.filter(match => 
            (match.season || getSeasonFromDate(match.date)) === selectedSeason
        );
    }
    
    if (filteredMatches.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Geen wedstrijden gevonden</td></tr>';
        return;
    }
    
    // Sorteer op datum (nieuwste eerst)
    filteredMatches.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    filteredMatches.forEach(match => {
        const matchDate = new Date(match.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let result = '';
        let resultClass = '';
        let scoreDisplay = '';
        
        // Alleen resultaat tonen voor wedstrijden in het verleden
        if (matchDate < today) {
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
            scoreDisplay = `${match.homeScore} - ${match.awayScore}`;
        } else {
            result = 'Nog te spelen';
            resultClass = '';
            scoreDisplay = '-';
        }
        
        const row = document.createElement('tr');
        if (match.isEvent) {
            row.classList.add('event-row');
        }
        
        const detailsButton = match.isEvent 
            ? '<span class="disabled-link">-</span>' 
            : `<a href="/match-details.html?id=${match.id}" class="btn-details">Details</a>`;
        
        row.innerHTML = `
            <td>${match.date}</td>
            <td>${match.opponent}</td>
            <td>${scoreDisplay}</td>
            <td class="${resultClass}">${result}</td>
            <td>
                <label class="checkbox-container">
                    <input type="checkbox" 
                           class="event-checkbox" 
                           data-match-id="${match.id}" 
                           ${match.isEvent ? 'checked' : ''}>
                    <span class="checkbox-label">Evenement</span>
                </label>
            </td>
            <td>${detailsButton}</td>
        `;
        tbody.appendChild(row);
    });
}

// Toggle evenement status
async function toggleEventStatus(matchId, isEvent, checkboxElement) {
    try {
        const response = await fetch(`/api/matches/${matchId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isEvent })
        });
        
        if (response.ok) {
            // Update lokale data
            const match = allMatches.find(m => m.id === matchId);
            if (match) {
                match.isEvent = isEvent;
            }
            
            // Update alleen de rij styling zonder volledige refresh
            const row = checkboxElement.closest('tr');
            if (isEvent) {
                row.classList.add('event-row');
                // Verberg details button
                const actionsCell = row.querySelector('td:last-child');
                actionsCell.innerHTML = '<span class="disabled-link">-</span>';
            } else {
                row.classList.remove('event-row');
                // Toon details button
                const actionsCell = row.querySelector('td:last-child');
                actionsCell.innerHTML = `<a href="/match-details.html?id=${matchId}" class="btn-details">Details</a>`;
            }
        } else {
            alert('Fout bij het bijwerken van evenement status');
            // Reset checkbox bij fout
            checkboxElement.checked = !isEvent;
        }
    } catch (error) {
        console.error('Error toggling event status:', error);
        alert('Fout bij het bijwerken van evenement status');
        // Reset checkbox bij fout
        checkboxElement.checked = !isEvent;
    }
}

// Laad wedstrijden bij pagina load
document.addEventListener('DOMContentLoaded', () => {
    loadMatches();
    
    // Event listener voor evenement checkboxes (delegatie)
    document.getElementById('matches-tbody').addEventListener('change', (e) => {
        if (e.target.classList.contains('event-checkbox')) {
            const matchId = e.target.dataset.matchId;
            const isEvent = e.target.checked;
            toggleEventStatus(matchId, isEvent, e.target);
        }
    });
    
    // Add match form handler
    const addMatchForm = document.getElementById('add-match-form');
    addMatchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(addMatchForm);
        const matchData = {
            date: formData.get('date'),
            opponent: formData.get('opponent'),
            isHomeGame: formData.get('isHomeGame') === 'true',
            homeScore: 0,
            awayScore: 0,
            scorers: [],
            lineup: [],
            notes: ''
        };
        
        try {
            const response = await fetch('/api/matches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(matchData)
            });
            
            if (response.ok) {
                alert('Wedstrijd succesvol toegevoegd!');
                addMatchForm.reset();
                loadMatches(); // Herlaad de wedstrijdlijst
            } else {
                alert('Fout bij het toevoegen van de wedstrijd');
            }
        } catch (error) {
            console.error('Error adding match:', error);
            alert('Fout bij het toevoegen van de wedstrijd');
        }
    });
});
