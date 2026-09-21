-- Base theme (server.cfg spz_theme_* convars via spz-core).
local function pushPollTheme(theme)
    if theme and next(theme) then
        SendNUIMessage({ action = 'theme', theme = theme })
    end
end
CreateThread(function()
    local ok, theme = pcall(function() return exports['spz-core']:GetTheme() end)
    if ok then pushPollTheme(theme) end
end)
AddEventHandler('SPZ:themeUpdated', function(theme) pushPollTheme(theme) end)

local isPollOpen = false

-- ── Vehicle names ────────────────────────────────────────────────────────────
--
-- The server sends a model name and whatever label its registry holds. The
-- MANUFACTURER and the game's own display name only exist client-side — they
-- are GXT entries, and GetLabelText is a client native — so the card is
-- completed here rather than by sending a name the server had to guess at.
--
-- That matters most for add-on cars: spz-vehicles has to derive their label
-- from the model name ("gbelegyrh2" -> "Gbelegyrh2"), while the pack itself
-- ships the real text. Reading it here gets "Annis / Elegy RH2" on the card
-- for free, and falls back to the server's label when a pack ships no text.
local function labelOrNil(gxt)
    if type(gxt) ~= "string" or gxt == "" then return nil end
    local text = GetLabelText(gxt)
    if not text or text == "" or text == "NULL" then return nil end
    return text
end

--- Adds `brand` and `code` to a vehicle option, and upgrades `label` to the
--- game's display name when there is one.
local function describeVehicle(opt)
    local model = opt and opt.name
    if type(model) ~= "string" or model == "" then return end

    -- The spawn code is the model name itself, and it is worth printing: it is
    -- what a player types into the spawner to try the car again later, and for
    -- an add-on it is the only handle they have on it.
    opt.code = model:lower()

    local hash = GetHashKey(model)
    if not IsModelInCdimage(hash) then return end

    opt.brand = labelOrNil(GetMakeNameFromVehicleModel(hash))
    opt.label = labelOrNil(GetDisplayNameFromVehicleModel(hash)) or opt.label
end

---@param data table { phase: string, timer: number, options: table }
local function StartPoll(data)
    if not data then return end
    isPollOpen = true
    SetNuiFocus(true, true)

    if data.phase == "vehicle" and type(data.options) == "table" then
        for _, opt in ipairs(data.options) do describeVehicle(opt) end
    end

    SendNUIMessage({
        action = "openPoll",
        data = data
    })
end

local function StopPoll()
    isPollOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({
        action = "closePoll"
    })
end

local function UpdatePoll(data)
    SendNUIMessage({
        action = "updatePoll",
        data = data
    })
end

-- Exports
exports('StartPoll', StartPoll)
exports('StopPoll', StopPoll)
exports('UpdatePoll', UpdatePoll)

-- NUI Callbacks
-- A ballot can carry a switch alongside the cards (the traffic phase votes on
-- NPC cops that way instead of spending a whole extra phase on one yes/no), so
-- the toggle position rides with the picked index in a single submission.
-- "Give us a different set." Counted at the close as a majority of the players
-- who actually voted (spz-races/server/poll.lua), so this only records the
-- player's position — it never restarts anything on its own.
RegisterNUICallback('pollReroll', function(data, cb)
    TriggerServerEvent('SPZ:pollReroll', data and data.on == true)
    cb('ok')
end)

RegisterNUICallback('pollVote', function(data, cb)
    TriggerServerEvent('SPZ:pollVote', {
        index  = data.index,
        toggle = data.toggle,
    })

    cb('ok')
end)


-- Events from server
RegisterNetEvent('spz-poll:client:start', function(data)
    StartPoll(data)
end)

RegisterNetEvent('spz-poll:client:stop', function()
    StopPoll()
end)

RegisterNetEvent('spz-poll:client:update', function(data)
    UpdatePoll(data)
end)

-- Test Command
RegisterCommand('testpoll', function()
    local testData = {
        phase = "track",
        timer = 15,
        options = {
            -- `path` is the route in world XY (see spz-races/server/poll.lua);
            -- a couple of hand-made shapes here so /testpoll exercises the map
            -- preview for both a closed circuit and a point-to-point sprint.
            { label = "Downtown Loop", type = "circuit", laps = 3, checkpointCount = 24, loop = true,
              path = {
                { x = 250, y = -960 }, { x = 700, y = -860 }, { x = 1020, y = -820 },
                { x = 720, y = -580 }, { x = 420, y = -290 }, { x = 175, y = -355 },
                { x = -240, y = -640 }, { x = 10, y = -900 },
              } },
            { label = "Great Ocean Run", type = "sprint", laps = 1, checkpointCount = 42, loop = false,
              path = {
                { x = -1800, y = -1200 }, { x = -2100, y = 300 }, { x = -1600, y = 1900 },
                { x = -400, y = 3100 }, { x = 900, y = 3600 }, { x = 1900, y = 3800 },
              } },
        }
    }
    StartPoll(testData)
    
    -- Simulate result after 10s
    Citizen.SetTimeout(10000, function()
        UpdatePoll({ winner = { index = 1 } })
    end)
    
    -- Close after 15s
    Citizen.SetTimeout(15000, function()
        StopPoll()
    end)
end, false)

-- Vehicle ballot. Models are spawn names, same as the real ballot sends
-- (spz-races/server/poll.lua uses veh.model).
RegisterCommand('testpollcar', function(_, args)
    StartPoll({
        phase = "vehicle",
        timer = 20,
        duration = 20,
        options = {
            { name = args[1] or "sultan",  label = "Sultan",  subtext = "Class C",
              stats = { { label = "Speed", value = "84" }, { label = "Accel", value = "72" } } },
            { name = args[2] or "comet2",  label = "Comet",   subtext = "Class B",
              stats = { { label = "Speed", value = "91" }, { label = "Accel", value = "80" } } },
        }
    })
    Citizen.SetTimeout(20000, function() StopPoll() end)
end, false)

-- Traffic ballot, including the switch it carries. This is the phase that votes
-- NPC cops on or off (spz-races/server/poll.lua builds the real one), so the
-- test has to send a `toggle` or the switch never renders.
RegisterCommand('testpolltraffic', function()
    StartPoll({
        phase = "traffic",
        timer = 20,
        duration = 20,
        step = 3,
        steps = 3,
        toggle = {
            key      = "chase",
            label    = "Cop Chase",
            onLabel  = "COPS ON",
            offLabel = "COPS OFF",
            hint     = "Pick up a wanted level and police hunt you. Ramming and PIT only — they never shoot.",
            default  = false,
        },
        options = {
            { name = "none",  label = "No Traffic",    subtext = "Empty streets" },
            { name = "light", label = "Light Traffic", subtext = "A few cars" },
            { name = "heavy", label = "Heavy Traffic", subtext = "Busy roads" },
        }
    })
    Citizen.SetTimeout(20000, function() StopPoll() end)
end, false)
