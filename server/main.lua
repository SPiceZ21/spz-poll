local activePoll = nil

---@param data table { phase: string, timer: number, options: table }
local function StartPoll(data)
    activePoll = {
        data = data,
        votes = {},
        participants = {}
    }
    
    -- Initialize votes
    for i = 1, #data.options do
        activePoll.votes[i] = 0
    end
    
    TriggerClientEvent('spz-poll:client:start', -1, data)
end

local function StopPoll()
    activePoll = nil
    TriggerClientEvent('spz-poll:client:stop', -1)
end

exports('StartPoll', StartPoll)
exports('StopPoll', StopPoll)

RegisterNetEvent('spz-poll:server:vote', function(index)
    local src = source
    if not activePoll then return end
    if activePoll.participants[src] then return end -- Already voted
    
    activePoll.participants[src] = index
    activePoll.votes[index] = (activePoll.votes[index] or 0) + 1
    
    -- Forward to spz-races for early tally and state transition
    -- spz-races expects { index = index } as first arg
    -- source is preserved in the call stack for the local TriggerEvent
    TriggerEvent("SPZ:pollVote", { index = index })
end)
