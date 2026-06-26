import sendEmail from './src/utils/sendEmail.js';

sendEmail({
  to: 'madhudissa2003@gmail.com',
  subject: 'Test sendEmail',
  html: '<p>Testing sendEmail.js</p>'
}).then(() => console.log('Done')).catch(e => console.error(e));
