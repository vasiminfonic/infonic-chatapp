const totalUser = [];

// joins the user to the specific chatroom
export function joinUser(id, user, room) {
  const p_user = { id, user, room };

  totalUser.push(p_user);
  // console.log(totalUser, "users");
  
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
      if(data.user._id !== data.room){
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
  if (index !== -1) {
    return totalUser.splice(index, 1)[0];
  }
}

