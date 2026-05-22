// Note Selector Modal
const noteSelector = {
    overlay: null,
    callback: null,

    open(currentNote, onSelect) {
        this.callback = onSelect;
        const notes = Object.keys(tonePlayer.frequencies).sort((a, b) => {
            const octaveA = parseInt(a.slice(-1)) * 12 + noteToMidi(a[0]);
            const octaveB = parseInt(b.slice(-1)) * 12 + noteToMidi(b[0]);
            return octaveA - octaveB;
        });

        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.innerHTML = `
            <div class="modal">
                <h3>Choose a Note</h3>
                <div class="note-grid" id="noteGrid"></div>
                <button class="btn btn-secondary" style="margin-top:16px;width:100%" onclick="noteSelector.close()">Cancel</button>
            </div>
        `;

        const grid = this.overlay.querySelector('#noteGrid');
        notes.forEach(note => {
            const btn = document.createElement('button');
            btn.className = 'note-btn' + (note === currentNote ? ' selected' : '');
            btn.textContent = note;
            btn.onclick = async () => {
                await tonePlayer.playNote(note);
                this.callback(note);
                this.close();
            };
            grid.appendChild(btn);
        });

        // Close on overlay click
        this.overlay.onclick = (e) => {
            if (e.target === this.overlay) this.close();
        };

        document.body.appendChild(this.overlay);
    },

    close() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }
};

function noteToMidi(noteChar) {
    const map = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
    return map[noteChar.toUpperCase()] || 0;
}
