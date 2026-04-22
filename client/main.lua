local isPollOpen = false

---@param data table { phase: string, timer: number, options: table }
local function StartPoll(data)
    if not data then return end
    isPollOpen = true
    SetNuiFocus(true, true)
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
RegisterNUICallback('pollVote', function(data, cb)
    local index = data.index
    TriggerServerEvent('spz-poll:server:vote', index)
    
    -- We keep focus but allow user to still see things. 
    -- Actually, usually you want to keep focus until poll ends or they manually close?
    -- For now, keep focus so they can't drive while voting if that's desired, 
    -- or release it after vote?
    -- User might want to see the timer finish.
    
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
            { label = "Downtown Loop", type = "circuit", laps = 3, checkpointCount = 24 },
            { label = "Great Ocean Run", type = "sprint", laps = 1, checkpointCount = 42 }
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
