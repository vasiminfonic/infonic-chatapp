class UserDto {
    _id;
    name;
    email;
    image;
    country;
    phone;
    createdAt;
    role;
    constructor(user){
        this._id = user._id;
        this.name = user.name;
        this.email = user.email;
        this.image = user.image;
        this.role = user.role;
        this.country= user.country;
        this.phone = user.phone;
        this.createdAt = user.createdAt;
    }
}
export default UserDto;