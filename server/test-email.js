// SMTP Test Script - run with: node test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n========================================');
console.log('SMTP Configuration Test');
console.log('========================================');
console.log('SMTP_HOST :', process.env.SMTP_HOST);
console.log('SMTP_PORT :', process.env.SMTP_PORT);
console.log('SMTP_USER :', process.env.SMTP_USER);
console.log('SMTP_PASS :', process.env.SMTP_PASS ? 'SET (' + process.env.SMTP_PASS.length + ' chars)' : 'NOT SET');
console.log('========================================\n');

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('SMTP credentials are missing. Check your .env file.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: parseInt(process.env.SMTP_PORT || '465') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

console.log('Verifying SMTP connection...');
transporter.verify((error) => {
  if (error) {
    console.error('SMTP Connection FAILED!');
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('SMTP connection OK - sending test email...');

  transporter.sendMail({
    from: '"BiharKaSwaad Test" <' + process.env.SMTP_USER + '>',
    to: process.env.SMTP_USER,
    subject: 'SMTP Test - BiharKaSwaad',
    html: '<h2>SMTP is working!</h2><p>Time: ' + new Date().toLocaleString() + '</p>',
  }, (err, info) => {
    if (err) {
      console.error('Failed to send:', err.message);
    } else {
      console.log('Test email SENT! Message ID:', info.messageId);
    }
    process.exit(0);
  });
});
