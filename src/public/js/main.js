console.log('FC Verachtert Tracker loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    
    const matchList = document.getElementById('match-list');
    const playerList = document.getElementById('player-list');
    
    // Fetch and display matches if element exists
    if (matchList) {
        fetch('/api/matches')
            .then(response => response.json())
            .then(matches => {
                matches.forEach(match => {
                    const matchItem = document.createElement('li');
                    matchItem.textContent = `${match.date}: ${match.opponent} - ${match.homeScore}:${match.awayScore}`;
                    matchList.appendChild(matchItem);
                });
            })
            .catch(error => console.error('Error fetching matches:', error));
    }
    
    // Fetch and display players if element exists
    if (playerList) {
        fetch('/api/players')
            .then(response => response.json())
            .then(players => {
                players.forEach(player => {
                    const playerItem = document.createElement('li');
                    playerItem.textContent = `${player.name} - ${player.position} (#${player.jerseyNumber})`;
                    playerList.appendChild(playerItem);
                });
            })
            .catch(error => console.error('Error fetching players:', error));
    }
});