require('dotenv').config();
const nodemailer = require('nodemailer');

const portNum = parseInt(process.env.SMTP_PORT || '465');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: portNum,
  secure: portNum === 465, // true for 465 (SSL), false for 587 (TLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

console.log('Testing SMTP connection with settings:');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', portNum);
console.log('User:', process.env.SMTP_USER);
console.log('Pass:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-3) : 'UNDEFINED');

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection failed:');
    console.error(error);
  } else {
    console.log('✅ SMTP connection verified — ready to send emails');
    
    // Test sending an email
    transporter.sendMail({
      from: `"Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to self
      subject: 'Test Email',
      text: 'This is a test email.'
    }).then(info => {
      console.log('Test email sent:', info.messageId);
    }).catch(err => {
      console.error('Failed to send test email:', err);
    });
  }
});
