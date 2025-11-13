const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

// Datenverzeichnis erstellen
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Database {
    constructor(filename) {
        this.filepath = path.join(DATA_DIR, `${filename}.json`);
        this.data = this.load();
    }

    load() {
        try {
            if (fs.existsSync(this.filepath)) {
                const rawData = fs.readFileSync(this.filepath, 'utf8');
                return JSON.parse(rawData);
            }
        } catch (error) {
            console.error(`Fehler beim Laden von ${this.filepath}:`, error);
        }
        return [];
    }

    save() {
        try {
            fs.writeFileSync(this.filepath, JSON.stringify(this.data, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error(`Fehler beim Speichern von ${this.filepath}:`, error);
            return false;
        }
    }

    // Finde einen Eintrag
    findOne(query) {
        return this.data.find(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
    }

    // Finde alle Einträge
    find(query = {}) {
        if (Object.keys(query).length === 0) return this.data;
        
        return this.data.filter(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
    }

    // Füge Eintrag hinzu
    insert(data) {
        const entry = {
            _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...data,
            createdAt: new Date().toISOString()
        };
        this.data.push(entry);
        this.save();
        return entry;
    }

    // Update Eintrag
    updateOne(query, update) {
        const index = this.data.findIndex(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });

        if (index !== -1) {
            this.data[index] = { ...this.data[index], ...update };
            this.save();
            return this.data[index];
        }
        return null;
    }

    // Lösche Eintrag
    deleteOne(query) {
        const index = this.data.findIndex(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });

        if (index !== -1) {
            const deleted = this.data.splice(index, 1);
            this.save();
            return deleted[0];
        }
        return null;
    }

    // Zähle Einträge
    count(query = {}) {
        return this.find(query).length;
    }

    // Lade Daten neu
    reload() {
        this.data = this.load();
        return this.data;
    }

    // Sortiere und limitiere
    findSorted(query = {}, sortField = 'createdAt', limit = null) {
        let results = this.find(query);
        results.sort((a, b) => {
            if (a[sortField] > b[sortField]) return -1;
            if (a[sortField] < b[sortField]) return 1;
            return 0;
        });
        
        if (limit) {
            results = results.slice(0, limit);
        }
        
        return results;
    }
}

module.exports = Database;
