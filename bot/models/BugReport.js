const Database = require('../utils/database');

class BugReport {
    constructor() {
        this.db = new Database('bugreports');
    }
    
    generateId() {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const randomId = Math.floor(1000 + Math.random() * 9000);
        return `BUG-${dateStr}-${randomId}`;
    }
    
    create(data) {
        console.log('🐛 BugReport.create() called with:', data);
        this.db.reload();
        console.log('📊 Current bug reports count:', this.db.data.length);
        
        const bugReport = {
            id: this.generateId(),
            userId: data.userId,
            username: data.username,
            guildId: data.guildId || null,
            guildName: data.guildName || null,
            title: data.title,
            description: data.description,
            steps: data.steps || null,
            expectedBehavior: data.expectedBehavior || null,
            actualBehavior: data.actualBehavior || null,
            priority: 'medium',
            status: 'open',
            notes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('📝 Generated bug report:', bugReport);
        
        this.db.data.push(bugReport);
        const saved = this.db.save();
        console.log('💾 Save result:', saved ? 'Success' : 'Failed');
        console.log('📊 New bug reports count:', this.db.data.length);
        
        return bugReport;
    }
    
    findAll() {
        console.log('🔍 BugReport.findAll() called');
        this.db.reload();
        console.log('📊 Found', this.db.data.length, 'bug reports');
        return this.db.data || [];
    }
    
    findById(id) {
        this.db.reload();
        return this.db.data.find(bug => bug.id === id);
    }
    
    updatePriority(id, priority) {
        this.db.reload();
        const bug = this.db.data.find(b => b.id === id);
        if (bug) {
            bug.priority = priority;
            bug.updatedAt = new Date().toISOString();
            this.db.save();
            return bug;
        }
        return null;
    }
    
    updateStatus(id, status, note = null) {
        this.db.reload();
        const bug = this.db.data.find(b => b.id === id);
        if (bug) {
            bug.status = status;
            bug.updatedAt = new Date().toISOString();
            if (note) {
                bug.notes.push({
                    text: note,
                    timestamp: new Date().toISOString()
                });
            }
            this.db.save();
            return bug;
        }
        return null;
    }
    
    addNote(id, note) {
        this.db.reload();
        const bug = this.db.data.find(b => b.id === id);
        if (bug) {
            bug.notes.push({
                text: note,
                timestamp: new Date().toISOString()
            });
            bug.updatedAt = new Date().toISOString();
            this.db.save();
            return bug;
        }
        return null;
    }
    
    delete(id) {
        this.db.reload();
        const initialLength = this.db.data.length;
        this.db.data = this.db.data.filter(b => b.id !== id);
        this.db.save();
        return this.db.data.length < initialLength;
    }
    
    countByStatus(status) {
        this.db.reload();
        return this.db.data.filter(b => b.status === status).length;
    }
}

module.exports = new BugReport();
