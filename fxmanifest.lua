fx_version 'cerulean'
game 'gta5'

description 'SPiceZ Poll Module'
author 'SPiceZ'
version '1.1.1'

ui_page 'ui/dist/index.html'

files {
    'ui/dist/**/*',
}

client_scripts {
    'client/main.lua'
}

server_scripts {
    'server/main.lua'
}

exports {
    'StartPoll',
    'StopPoll'
}

