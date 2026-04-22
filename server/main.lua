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
    
    -- Auto-stop after timer
    Citizen.SetTimeout((data.timer or 30) * 1000, function()
        if activePoll then
            local winnerIndex = 1
            local maxVotes = -1
            
            for i, count in pairs(activePoll.votes) do
                if count > maxVotes then
                    maxVotes = count
                    winnerIndex = i
                end
            end
            
            TriggerClientEvent('spz-poll:client:update', -1, { winner = { index = winnerIndex } })
            
            -- Wait a bit to show winner then close
            Citizen.Wait(5000)
            StopPoll()
        end
    end)
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
    
    -- Optional: Sync vote counts in real-time? 
    -- The original UI didn't show vote counts, only the winner at the end.
end)
