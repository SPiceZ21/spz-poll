const pollApp = document.getElementById('poll-app');
const pollPhase = document.getElementById('poll-phase');
const pollOptions = document.getElementById('poll-options');
const timerFill = document.getElementById('poll-timer-fill');

let hasVoted = false;
let selectedIndex = -1;

window.addEventListener('message', (event) => {
    const data = event.data;

    switch (data.action) {
        case 'openPoll':
            openPoll(data.data);
            break;
        case 'updatePoll':
            updatePoll(data.data);
            break;
        case 'closePoll':
            closePoll();
            break;
    }
});

function openPoll(data) {
    hasVoted = false;
    selectedIndex = -1;
    
    pollPhase.innerText = data.phase === 'track' ? 'CHOOSE TRACK' : 'CHOOSE VEHICLE';
    renderOptions(data);
    
    // Timer animation
    timerFill.style.animation = 'none';
    timerFill.offsetHeight; // trigger reflow
    timerFill.style.animation = `poll-timer-drain ${data.timer || 30}s linear forwards`;
    
    pollApp.style.display = 'flex';
}

function renderOptions(data) {
    pollOptions.innerHTML = '';
    const options = data.options || [];

    options.forEach((opt, i) => {
        const card = document.createElement('div');
        card.className = `poll-card${i % 2 === 1 ? ' right' : ''}`;
        card.onclick = () => handleVote(i);

        const bgNum = document.createElement('span');
        bgNum.className = 'poll-bg-num';
        bgNum.innerText = i + 1;
        card.appendChild(bgNum);

        const content = document.createElement('div');
        content.className = 'poll-content';

        const title = document.createElement('div');
        title.className = 'poll-title';
        title.innerText = opt.label || opt.name;
        content.appendChild(title);

        const meta = document.createElement('div');
        meta.className = 'poll-meta';

        if (data.phase === 'track') {
            meta.innerHTML = `
                <span class="meta-orange">${(opt.type || 'CIRCUIT').toUpperCase()}</span>
                <span class="meta-orange">${opt.laps || 3} LAPS</span>
                <span class="meta-blue">${opt.checkpointCount || '?'} CPS</span>
            `;
        } else {
            meta.innerHTML = `
                <span class="meta-orange">${opt.subtext || opt.class || 'CLASS'}</span>
            `;
            if (opt.stats) {
                opt.stats.forEach(s => {
                    const stat = document.createElement('span');
                    stat.className = 'meta-blue';
                    stat.innerText = `${s.label}: ${s.value}`;
                    meta.appendChild(stat);
                });
            }
        }
        content.appendChild(meta);
        card.appendChild(content);
        pollOptions.appendChild(card);
    });
}

function handleVote(index) {
    if (hasVoted) return;

    hasVoted = true;
    selectedIndex = index;

    const cards = document.querySelectorAll('.poll-card');
    cards.forEach((card, i) => {
        if (i === index) {
            card.classList.add('selected');
            const line = document.createElement('div');
            line.className = 'voted-line';
            card.appendChild(line);
        }
    });

    sendToLua('pollVote', { index: index + 1 });
}

function updatePoll(data) {
    if (data.winner) {
        const winnerIdx = data.winner.index - 1;
        const cards = document.querySelectorAll('.poll-card');
        if (cards[winnerIdx]) {
            const border = document.createElement('div');
            border.className = 'winner-border';
            cards[winnerIdx].appendChild(border);
        }
    }
}

function closePoll() {
    pollApp.style.animation = 'none';
    pollApp.offsetHeight;
    pollApp.style.animation = 'poll-slide-up 0.28s ease-out reverse both';
    
    setTimeout(() => {
        pollApp.style.display = 'none';
        pollOptions.innerHTML = '';
    }, 300);
}

function sendToLua(event, data) {
    fetch(`https://${GetParentResourceName()}/${event}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data)
    }).catch(err => console.error('NUI Error:', err));
}
