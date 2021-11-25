class UserDto {
    _id;
    name;
    email;
    image;
    country;
    phone;
    createdAt;
    constructor(user){
        this._id = user._id;
        this.name = user.name;
        this.email = user.email;
        this.image = user.image;
        this.country= user.country;
        this.phone = user.phone;
        this.createdAt = user.createdAt;
    }
}
export default UserDto;