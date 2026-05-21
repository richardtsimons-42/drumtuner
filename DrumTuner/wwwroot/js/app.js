// Main App - Navigation & State Management
const app = {
    currentPage: 'selector',
    currentDrumId: null,

    async init() {
        await tonePlayer.loadFrequencies();

        // Set up nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.onclick = () => this.navigate(btn.dataset.page);
        });

        this.navigate('selector');
    },

    navigate(page) {
        this.currentPage = page;

        // Update nav active state
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-btn[data-page="${page}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        switch (page) {
            case 'selector':
                drumSelector.init();
                break;
            case 'journal':
                journal.init();
                break;
        }
    },

    async selectDrum(drumTypeId) {
        const data = await apiClient.instantiateDrum(drumTypeId);
        this.currentDrumId = data.id;

        // Load visualizer with the new drum's lugs
        document.getElementById('app').innerHTML = `
            <div class="visualizer-header">
                <div class="visualizer-title">
                    <h2>${data.name}</h2>
                    <p>${data.category} · ${data.lugs.length} lugs</p>
                    <div class="lug-status">
                        <span class="status-dot untuned"></span>
                        0/${data.lugs.length} tuned
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
                </div>
                <div class="visualizer-actions">
                    <button class="btn btn-secondary" onclick="app.showGuide()">📖 Guide</button>
                    <button class="btn btn-secondary" onclick="app.saveSession()">💾 Save</button>
                    <button class="btn btn-secondary" onclick="app.goHome()">← Back</button>
                </div>
            </div>
            <div class="drum-container">
                <canvas id="drumCanvas" width="400" height="400"></canvas>
            </div>
        `;

        // Store drum data globally for the visualizer
        window.currentDrum = data;
        window.lugs = Array.from(data.lugs);

        this.drawDrum();
    },

    drawDrum() {
        const canvas = document.getElementById('drumCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cx = 200, cy = 200, r = 160;
        const lugs = window.lugs;
        const count = lugs.length;

        ctx.clearRect(0, 0, 400, 400);

        // Drum head
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = '#2a2a3e';
        ctx.fill();
        ctx.strokeStyle = '#0f3460';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Bearing edge ring
        ctx.beginPath();
        ctx.arc(cx, cy, r - 20, 0, Math.PI * 2);
        ctx.strokeStyle = '#1a4a8a';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw lugs
        lugs.forEach((lug, i) => {
            const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
            const x = cx + (r - 10) * Math.cos(angle);
            const y = cy + (r - 10) * Math.sin(angle);

            ctx.beginPath();
            ctx.arc(x, y, 18, 0, Math.PI * 2);
            if (lug.tunedNote) {
                const hue = this.noteToHue(lug.tunedNote);
                ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
            } else {
                ctx.fillStyle = '#444';
            }
            ctx.fill();
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Lug number
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(lug.position, x, y);

            // Tuned note label
            if (lug.tunedNote) {
                ctx.fillStyle = '#fff';
                ctx.font = '9px sans-serif';
                ctx.fillText(lug.tunedNote, x, y - 26);
            }
        });

        // Click handler
        canvas.onclick = (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            lugs.forEach(lug => {
                const idx = lug.position - 1;
                const angle = (Math.PI * 2 * idx) / count - Math.PI / 2;
                const lx = cx + (r - 10) * Math.cos(angle);
                const ly = cy + (r - 10) * Math.sin(angle);
                const dist = Math.hypot(mx - lx, my - ly);

                if (dist < 22) {
                    this.showNoteSelector(lug);
                }
            });
        };

        this.updateProgress();
    },

    noteToHue(note) {
        const octave = parseInt(note.slice(-1));
        const noteName = note.slice(0, -1).replace('#', '');
        const semitones = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
        const semi = semitones[noteName] || 0;
        return ((octave - 1) * 12 + semi) * 360 / 48 % 360;
    },

    showNoteSelector(lug) {
        noteSelector.open(lug.tunedNote, async (note) => {
            const updated = await apiClient.updateLug(lug.id, note);
            lug.tunedNote = updated.tunedNote;
            this.drawDrum();
        });
    },

    updateProgress() {
        const lugs = window.lugs;
        if (!lugs) return;
        const tuned = lugs.filter(l => l.tunedNote).length;
        const total = lugs.length;
        const pct = (tuned / total * 100);

        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelectorAll('.lug-status span')[1];
        const progressFill = document.querySelector('.progress-fill');

        if (statusDot) {
            statusDot.className = `status-dot ${tuned === total ? 'tuned' : 'untuned'}`;
        }
        if (statusText) {
            statusText.textContent = `${tuned}/${total} tuned`;
        }
        if (progressFill) {
            progressFill.style.width = `${pct}%`;
        }
    },

    showGuide() {
        // Remove existing guide if present
        const existing = document.getElementById('guidePanel');
        if (existing) existing.remove();

        const guideDiv = document.createElement('div');
        guideDiv.id = 'guidePanel';
        guideDiv.className = 'guide-panel';
        guideDiv.innerHTML = tuningGuide.render();
        document.querySelector('.drum-container').after(guideDiv);
    },

    async saveSession() {
        const notes = prompt('Add notes for this session (optional):');
        if (notes === null) return;

        const records = window.lugs
            .filter(l => l.tunedNote)
            .map(l => ({ position: l.position, note: l.tunedNote }));

        if (records.length === 0) {
            alert('No lugs tuned yet!');
            return;
        }

        try {
            await apiClient.saveSession(window.currentDrum.drumTypeId, records, notes);
            alert('Session saved!');
        } catch (e) {
            alert('Failed to save: ' + e.message);
        }
    },

    goHome() {
        this.navigate('selector');
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => app.init());
