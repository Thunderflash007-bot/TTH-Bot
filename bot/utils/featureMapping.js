/**
 * Mapping von Commands und Buttons zu Features
 * Wird verwendet um Feature-Checks durchzuführen
 */

const FEATURE_MAPPING = {
    // Commands zu Features
    commands: {
        // Tickets
        'setup-tickets': 'tickets',
        'close': 'tickets',
        'priority': 'ticketPriority',
        'forward': 'ticketForward',
        
        // Moderation
        'warn': 'warns',
        'warns': 'warns',
        'unwarn': 'warns',
        'report': 'reports',
        'ban': 'ban',
        'kick': 'kick',
        'clear': 'clear',
        
        // Projects & Management
        'projekt': 'projects',
        'port': 'ports',
        'news': 'news',
        
        // Communication
        'vorschlag': 'vorschlag',
        'kummerkasten': 'kummerkasten',
        
        // Verification
        'verify': 'verify',
        'verify-setup': 'verify',
        
        // Prefix
        'prefix': 'prefix',
        
        // Config Commands (immer erlaubt)
        'config': null,
        'team': null,
        'welcome-setup': null,
        'help': null,
        'serverinfo': null,
        'userinfo': null,
        'level': null
    },
    
    // Buttons zu Features
    buttons: {
        'ticket_open': 'tickets',
        'ticket_close': 'tickets',
        'ticket_claim': 'tickets',
        'ticket_unclaim': 'tickets',
        'ticket_assign': 'tickets',
        'application_open': 'tickets'
    },
    
    // Modals zu Features
    modals: {
        'kummerkasten': 'kummerkasten',
        'application': 'tickets'
    }
};

/**
 * Gibt das Feature für einen Command zurück
 */
function getFeatureForCommand(commandName) {
    return FEATURE_MAPPING.commands[commandName] || null;
}

/**
 * Gibt das Feature für einen Button zurück
 */
function getFeatureForButton(buttonId) {
    // Entferne Suffix (z.B. ticket_close_123 -> ticket_close)
    const baseId = buttonId.split('_').slice(0, 2).join('_');
    return FEATURE_MAPPING.buttons[baseId] || FEATURE_MAPPING.buttons[buttonId] || null;
}

/**
 * Gibt das Feature für ein Modal zurück
 */
function getFeatureForModal(modalId) {
    const baseId = modalId.split('_')[0];
    return FEATURE_MAPPING.modals[baseId] || null;
}

module.exports = {
    getFeatureForCommand,
    getFeatureForButton,
    getFeatureForModal,
    FEATURE_MAPPING
};
