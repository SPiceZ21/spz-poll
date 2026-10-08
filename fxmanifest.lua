fx_version 'cerulean'
game 'gta5'

description 'SPiceZ Poll Module'
author 'SPiceZ'
version '1.3.0'

ui_page 'ui/dist/index.html'

files {
    'ui/dist/**/*',
}

client_scripts {
    'client/main.lua'
}

exports {
    'StartPoll',
    'StopPoll',
    'UpdatePoll'
}

dependencies {
    'spz-core',
}

