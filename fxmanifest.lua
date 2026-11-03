fx_version 'cerulean'
game 'gta5'

description 'SPiceZ Poll Module'
author 'SPiceZ'
version '1.7.2'

-- ui_page 'ui/dist/index.html'  -- drawn by spz-hud now (web/public/apps/spz-poll); uncomment + drop the shim to roll back

files {
    'ui/dist/**/*',
}

client_scripts {
    '@spz-hud/shim.lua',   -- NUI goes through spz-hud
    'client/main.lua'
}

exports {
    'StartPoll',
    'StopPoll',
    'UpdatePoll'
}

dependencies {
    'spz-hud',
    'spz-core',
}

