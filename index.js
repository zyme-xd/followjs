const Twit = require('twit')
let info = []
let user = 'zyrnwtf'
let userid = '1069424841676210176'
 global.initial_ids = []
require('dotenv').config()
const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
})
main()
 async function main() {
 initial_ids = await getid()
 let time = Math.ceil(initial_ids.length / 100)
 for(i=0; time > i; i++){
   if(i < time){
    subid = initial_ids.splice(0,99)
    await delay(60000)
    info.push(await get('users/lookup', {user_id: subid}))
   } else if(i ==  time){
    subid = initial_ids.splice(0,initial_ids.length)
    info.push(await get('users/lookup', {user_id: subid}))
   }
 }
 info = info.flat()
 console.log(info)
 while(true){
  await delay(120000)
   await compare()
 }
}
async function get(endpoint, options){
  return new Promise((res, rej) => T.get(endpoint, options, function(err, data, response){
    if (err) {
      rej(err)
    }
    res(data)
 }))
}
async function delay(ms){
  return new Promise(res => setTimeout(res, ms))
}
async function getid(){
  let data = await get('followers/ids', {screen_name: `${user}`, stringify_ids:true})
  console.log(data)
  let ids = data.ids
  while (data.next_cursor) {
    await delay(180000)
   data = await get('followers/ids', {screen_name: `${user}`, stringify_ids: true, cursor: data.next_cursor_str})
   console.log('fetching more')
   console.log(data)
   ids = [...ids,...data.ids]
  }
  console.log('fetched initial ids')
  return ids
}
async function compare(){
  let reason = 'Unfollowed/Blocked'
    let new_ids = await getid()
    console.log('fetched new ids')
    for(i=0; info.length>i; i++){
      // if ur reading this i need to finish writing this for loop i took this pic b4 i finished this
      if(new_ids.indexOf(info[i].id_str) == -1){
       let data = await get('users/lookup', {user_id: info[i].id_str})
          console.log(data) 
          if(data[0].id_str == undefined){
             reason = 'Suspended'
             data[0].screen_name = info[i].screen_name
             data[0].name = info[i].name
             data[0].id_str = info[i].id_str
          } else if(data[0].friends_count == 0){
            reason = 'Unfollowed All/Locked'
          }
          T.post('direct_messages/events/new', {event:{type: 'message_create', message_create: {target:{recipient_id: `${userid}`}, message_data:{text: `userid: ${data[0].id_str} \n handle: @${data[0].screen_name} \n  Reason: ${reason}`}}}})
          console.log(`userid: ${data[0].id_str} \n handle: ${data[0].name} \n nickname: ${data[0].screen_name}`)
      }
    }
    initial_ids = new_ids
    info = [] // huh
   await main()
}