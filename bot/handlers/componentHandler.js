const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    // Buttons laden
    const buttonFiles = fs.readdirSync(path.join(__dirname, '../components/buttons'))
        .filter(file => file.endsWith('.js'));

    for (const file of buttonFiles) {
        const button = require(`../components/buttons/${file}`);
        if (button.id && button.execute) {
            client.buttons.set(button.id, button);
            console.log(`✅ Button geladen: ${button.id}`);
        }
    }

    // Modals laden
    const modalFiles = fs.readdirSync(path.join(__dirname, '../components/modals'))
        .filter(file => file.endsWith('.js'));

    for (const file of modalFiles) {
        const modal = require(`../components/modals/${file}`);
        if (modal.id && modal.execute) {
            client.modals.set(modal.id, modal);
            console.log(`✅ Modal geladen: ${modal.id}`);
        }
    }
};
