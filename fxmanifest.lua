fx_version 'cerulean'
game 'gta5'

description 'SPiceZ Poll Module'
author 'SPiceZ'
version '1.0.0'

ui_page 'ui/index.html'

files {
    'ui/index.html',
    'ui/style.css',
    'ui/script.js',
    'ui/public/fonts/*.ttf'
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
