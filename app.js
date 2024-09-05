const express = require('express')
const app = express()

const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
let db = null
const dbPath = path.join(__dirname, 'cricketTeam.db')
const intializeDBANDServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB error ${e.message}`)
    process.exit(1)
  }
}
intializeDBANDServer()
app.get('/players/', async (request, response) => {
  const getAllPlayers = `SELECT * FROM cricket_team ORDER BY player_id`
  const playersArray = await db.all(getAllPlayers)
  const convertDbObjectToResponseObject = dbObject => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    }
  }

  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {player_id, player_name, jersey_number, role} = playerDetails
  const playerQuery = `INSERT INTO cricket_team (player_id,player_name,jersey_number,role) 
  VALUES(${player_id},'${player_name}',${jersey_number},'${role}');`
  const dbResponse = await db.run(playerQuery)
  response.send('Player Added to Team')
})
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id=${playerId};`
  const player = await db.get(getPlayerQuery)
  response.send(player)
})
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {player_id, player_name, jersey_number, role} = playerDetails
  const updatePlayerQuery = `UPDATE cricket_team SET player_name='${player_name}',
  jersey_number=${jersey_number},
  'role=${role}' 
  WHERE player_id=${playerId}`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id=${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})
module.exports = app
