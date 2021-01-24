const kb = require('./keyboard-buttons')

module.exports = {
    home: [
        [kb.home.lists, kb.home.add_list],
        [kb.home.help]
    ],
    help: [
        [kb.help.feedback, kb.help.stop],
        [kb.back]
    ]

}