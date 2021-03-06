import nodemailer from "nodemailer";
import { SERVER_Path, EMAIL_KEY } from "../config";
import User from "../models/user";


class EmailService {
  constructor() {
    this.from =
      '"Singapore Translation Services" <singaporetranslatorss@gmail.com>';
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "singaporetranslatorss@gmail.com", // generated ethereal user
        pass: EMAIL_KEY, // generated ethereal password
      },
    });
  }

  async sendMailNewOrder(order) {
    const info = await this.transporter.sendMail({
      from: this.from, // sender address
      to: order.userId.email, // list of receivers
      subject: `Your Translation Code is - ${order.translationId}`, // Subject line
      replyTo: "info@singaporetranslators.com",
      text: `order registerd successfully order id is ${order.translationId}`, // plain text body
      html: `<div class="main" style="border:2px solid #FF893C; background-color:#efefef;">
  <div class="image" style="text-align:center;padding-top: 10px;"><img src="https://www.singaporetranslators.com/singaporetranslators/webroot/img/singapore-Translators.png" style="width:30%;">
 <a href="https://www.singaporetranslators.com/"> <h4 style="color:red">www.SingaporeTranslators.com</h4></a>
 <a href="mailto:info@singaporetranslators.com"> <h3 style="color:red">info@singaporetranslators.com</h3></a>
  <h2>Order Id: ${order.translationId}</h2>
  
  
   </div>
     
 <div class="middle image" style="background-color:#1a597c;min-height: 300px; text-align: justify;color:white;">
   
			<h2 style="font-size:20px; padding:10px;">Dear ${order.userId.name}  </h2>
			 
			<center style="font-size:16px; text-align:left;padding-left:10px">
			<p style="font-size:16px; text-align:left">Your Requirement has been Submitted Successfully.</p>

            <p style="font-size:16px; text-align:left">Welcome to SingaporeTranslators.com family.</p>

            <p style="font-size:16px; text-align:left">I am Julie, a support staff at SingaporeTranslators.com.</p>
            
            <p style="font-size:16px; text-align:left">We are glad to get your translation service query!</p>
            
            <p style="font-size:16px; text-align:left">The translators will review your requirements and get back to you with a suitable quote/reply. </p>
            
            <p style="font-size:16px; text-align:left">Let me help you to make the most out of our service. Here are some exclusive features you will get benefited by taking help from us:</p>
            <ul style="font-size:16px;font-weight:600">
            
            <li>Best Price Guarantee</li>
            <li>Proper Formatting</li>
            <li>Free Reworks</li> 
            <li>24/7 Personal Assistance via Email and Calls</li>
            <li>100% Privacy Guarantee</li>
            <li>Experienced Translators</li>
            <li>Notarisation and SAL Authentication Support</li>
            </ul> 
            </center>
          <p><center style="font-size:17px;padding:0 10px 0 10px;text-align:left">You have already taken the first right step for best Translation Services by filling the form. Now, simply wait for our price quote via mail and once you receive the same reply back with your decision.</p></center>
            
           <p><center style="font-size:17px;padding:0 10px 0 10px;text-align:left">You can also chat with our G-Talk advisers to help you get the BEST DEAL. We look forward to an opportunity to serve and make the difference in your lives.</p></center>
            
            
            
			<center style="font-size:17px; padding:10px;text-align:left;background-color:#efefef;"> 
<h3 style="color:#da251d;text-align:center;margin:0px">Thanks,<br />
Team Singapore Translators</h3>
<a href="https://www.singaporetranslators.com/"><h4 style="color:red;text-align:center;margin:0px">www.singaporetranslators.com</h4></a>

</center>
			 
		</div>`,
    });
    return info;
  }

  async sendMailAdmin(order) {
    const info = await this.transporter.sendMail({
      from: this.from, // sender address
      to: '"pc.saini2010@gmail.com",prakash.infonic@gmail.com', // list of receivers
      subject: `Your Translation Code is - ${order.translationId}`, // Subject line
      replyTo: "info@singaporetranslators.com",
      text: `order registerd successfully order id is ${order.translationId}`, // plain text body
      html: `<div class="main" style="border:2px solid #FF893C; background-color:#efefef;">
  <div class="image" style="text-align: center;padding-top: 10px;"><img src="https://www.singaporetranslators.com/singaporetranslators/webroot/img/singapore-Translators.png" style="width:30%;"> </div>
  	 
 <div class="middle image" style="background-color:#fff;min-height: 300px; text-align: justify;">
 
    <div class="admin" style="text-align:left;margin-left: 35px;color:#1d7bcf;font-weight: 26px;"><h2>Dear Admin</h2></div>
    <div class="text" style="font-size:18px;color: #4d4d4d;text-align: center;padding: 0px 22px;"><p>
 ${order.userId.name} upload a requirement on Singapore Translation Services  with Translation code</p></div>
<div class="order" style="text-align: left;margin-left: 35px;"><h1>
   ${order.translationId}
</h1></div>



<div class="order" style="text-align: left;margin-left: 20px;"><h4>
  Personal Information:-
</h4></div>
<table style="width:90%; border:1px solid;margin-left:20px;">
   
  <tr>
    <th style="border:1px solid;width:20%">Your name</th>
    <td  style="border:1px solid;">${order.userId.name}</td>
  </tr>
  <tr>
    <th style="border:1px solid;width:20%">Email</th>
    <td style="border:1px solid;">${order.userId.email}</td>
  </tr>
  <tr>
    <th style="border:1px solid;width:20%">Phone no</th>
    <td style="border:1px solid;">${order.country}${order.phone}</td>
  </tr>
  
   
</table>

<div class="order" style="text-align: left;margin-left: 20px;"><h4>
  Translation Detail:-${order.translationId}
</h4></div>

<table style="width:90%; border:1px solid;margin-left:20px;">
   
  
  <tr>
    <th style="border:1px solid;width:20%">Country Name</th>
    <td style="border:1px solid;">${order.country}</td>
  </tr>
  <tr>
    <th style="border:1px solid;width:20%">Deadline</th>
    <td style="border:1px solid;"> ${order.deadline}
    </td>
  </tr>
  <tr>
    <th style="border:1px solid;width:20%">Source language</th>
    <td style="border:1px solid;">${order.sourceLanguage}</td>
  </tr>
  <tr>
    <th style="border:1px solid;width:20%">Target language</th>
    <td style="border:1px solid;">${order.targetlanguage}</td>
  </tr>
  <tr>
    <th style="border:1px solid;width:20%">Certification</th>
    <td style="border:1px solid;"> ${order.certification}</td>
  </tr>
  <tr>
    <th style="border:1px solid;width:20%">Service Required</th>
    <td style="border:1px solid;">${order.service_req}</td>
  </tr>
  <tr>
    <th style="border:1px solid;width:20%">No. of Pages</th>
    <td style="border:1px solid;">${order.your_words}</td>
  </tr>
   <tr>
    <th style="border:1px solid;width:20%">Notarization & SAL Authentication  Required</th>
    <td style="border:1px solid;">${order.notarization}</td>
  </tr> 
   
  <tr>
    <th style="border:1px solid;width:20%">Your Message Here:</th>
    <td style="border:1px solid;">${order.message}</td>
  </tr>
  
  <tr>
    <th style="border:1px solid;width:20%">Upload Files:</th>
    <td style="border:1px solid;">
      
       
         ${order.files}
    </td>
  </tr>
  
   
</table>
		</div> 
	
 <div class="image footer" style="background-color:#efefef;text-align: center;margin: 10px 0 10px 0;">
 <img src="https://www.singaporetranslators.com/singaporetranslators/webroot/img/singapore-Translators.png"style="width:30%">
 </div></div>`,
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
  async setMailToOfflineUser(id, text) {
    const user = await User.findById(id);
    let info = await this.transporter.sendMail({
      from: this.from, // sender address
      to: user.email, // list of receivers
      subject: "new Message from infonic", // Subject line
      text: text, // plain text body
      html: `<b>Message from Singapore translators sent by website <br>${value.text}</b>`, // html body
    });
    return info;
  }
  async awaitEMail(user, values) {
    let info = await this.transporter.sendMail({
      from: this.from, // sender address
      to: user.email, // list of receivers
      subject: values.subject, // Subject line
      text: "Message from Singapore translators", // plain text body
      html: `<b>Message from Singapore translators<br>${values.message}</b>`, // html body
    });
    return info;
  }
}

export default new EmailService();
