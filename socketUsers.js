let totalUser = [];

// joins the user to the specific chatroom
export function joinUser(id, sender, room) {
  const p_user = { id, sender, room };
  totalUser.push(p_user);
  return p_user;
}


// Gets a particular user id to return the current user
export function getCurrentUser(id) {
  return totalUser.find((data) => data.id === id);
}
//gets a particular room users
export function getCurrentRoom(roomid) {
  return totalUser.find((room) => room.room === roomid);
}

export function isAdmin(data){
      if(data.sender._id !== data.room){
        return true;
      }
      else{
        return false;
      }
}
export function checkRoom(roomid){
  const currentroom = totalUser.filter((ele) => ele.room === roomid);
  if(currentroom.length == 1){
    if(isAdmin(currentroom[0])){
       return {empty: 'user'};
    }else{
       return {empty: 'admin'};
    }
  }else{
    return {empty: 'full'};
  } 
}

// called when the user leaves the chat and its user object deleted from array
export function userDisconnect(id) {
  const index = totalUser.findIndex((user) => user.id === id);
  const tempTotal = totalUser;
  totalUser = tempTotal.filter((e,i)=>i!==index);
  if (index !== -1) {
    return tempTotal.splice(index, 1)[0];
  }

}
export function totalOnlineUsers(){
  return totalUser;
}
console.log(totalUser);


