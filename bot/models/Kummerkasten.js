const Database = require('../utils/database');

class Kummerkasten {
    constructor() {
        this.db = new Database('kummerkasten');
    }

    find(query) {
        return this.db.find(query);
    }

    findOne(query) {
        return this.db.findOne(query);
    }

    create(data) {
        const kummerkasten = {
            id: Date.now().toString(),
            guildId: data.guildId,
            userId: data.userId,
            message: data.message,
            threadId: data.threadId,
            status: 'open', // open, in_progress, resolved
            createdAt: new Date().toISOString(),
            responses: []
        };
        return this.db.insert(kummerkasten);
    }

    addResponse(kummerkastenId, responseData) {
        const kummerkasten = this.db.findOne({ id: kummerkastenId });
        if (!kummerkasten) return null;
        
        kummerkasten.responses.push({
            userId: responseData.userId,
            message: responseData.message,
            timestamp: new Date().toISOString()
        });
        
        return this.db.updateOne({ id: kummerkastenId }, kummerkasten);
    }

    updateStatus(kummerkastenId, status) {
        return this.db.updateOne({ id: kummerkastenId }, { status });
    }

    save(kummerkasten) {
        if (kummerkasten._id) {
            return this.db.updateOne({ _id: kummerkasten._id }, kummerkasten);
        }
        return this.db.insert(kummerkasten);
    }
}

module.exports = new Kummerkasten();
