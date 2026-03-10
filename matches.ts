src/utils/calculateStandings.ts
  export interface Match {
  homeTeam: string
  awayTeam: string
  homeGoals: number
  awayGoals: number
}
export function calculateStandings(matches, teams) {

const table = {}

teams.forEach(team=>{
table[team] = {
played:0,
wins:0,
draws:0,
losses:0,
gf:0,
ga:0,
gd:0,
points:0
}
})

matches.forEach(match=>{

const home = table[match.homeTeam]
const away = table[match.awayTeam]

home.played++
away.played++

home.gf += match.homeGoals
home.ga += match.awayGoals

away.gf += match.awayGoals
away.ga += match.homeGoals

if(match.homeGoals > match.awayGoals){
home.wins++
home.points +=3
away.losses++
}
else if(match.homeGoals < match.awayGoals){
away.wins++
away.points +=3
home.losses++
}
else{
home.draws++
away.draws++
home.points++
away.points++
}

})

Object.values(table).forEach(team=>{
team.gd = team.gf - team.ga
})

return Object.entries(table)
.sort((a,b)=> b[1].points - a[1].points)

  }
