import nodemailer from "nodemailer";
import { SERVER_Path, EMAIL_KEY } from "../config";

class EmailService {
  constructor() {
    this.from = "vasim.infonic@gmail.com";
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "vasim.infonic@gmail.com", // generated ethereal user
        pass: EMAIL_KEY, // generated ethereal password
      },
    });
  }

  async sendMailNewOrder(order) {
    const info = await this.transporter.sendMail({
      from: this.from, // sender address
      to: order.userId.email, // list of receivers
      subject: "New Order", // Subject line
      text: `order registerd successfully order id is ${order.translationId}`, // plain text body
      html: `<b>Mr/Mrs ${order.userId.name} we have received your order details are following<br>
        Translation Id: ${order.translationId}<br>
        Source Language: ${order.sourceLanguage}<br>
        Target Language: ${order.targetlanguage}<br>
        Total Pages: ${order.your_words}<br>
        Certification: ${order.certification}<br> 
        Message: ${order.message}<br>
        Notarization: ${order.notarization}<br>
        Deadline: ${order.deadline}<br>
        <p>you may track your order ${SERVER_Path}</P>
        </b>`, // html body
    });
    return info;
  }

  async sendMailNewUser(user) {
    const info = await this.transporter.sendMail({
      from: this.from, // sender address
      to: user.email, // list of receivers
      subject: "User Login Credentials", // Subject line
      text: `${user.name} you are registerd`, // plain text body
      html: `<b>here is your credentials keep it confidential<br>
        email: ${user.email}<br>
        password: ${user.password}<br>
        signIn: ${SERVER_Path} for order tracking        
        <b>`, // html body
    });
    return info;
  }

  async sendMailExistUser(user) {
    const info = await this.transporter.sendMail({
      from: this.from, // sender address
      to: user.email, // list of receivers
      subject: "Already Register", // Subject line
      text: `${user.name} you are registerd`, // plain text body
      html: `<b>your just track your order with your credential<br>
        signIn: ${SERVER_Path} for order tracking        
        <b>`, // html body
    });
    return info;
  }
  
}

export default new EmailService();
