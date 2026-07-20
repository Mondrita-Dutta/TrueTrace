const nodemailer = require('nodemailer');

// Using Ethereal Email for testing/development
// To view sent emails, you would log into the Ethereal account, but 
// we will just log the test message URL to the console.
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'lennie.wehner89@ethereal.email',
    pass: 'P3b593tZ2NkxG1M4gD' // A temporary ethereal account (replace with ENV vars in prod)
  }
});

const sendCounterfeitReportEmail = async (manufacturerEmail, reportData, productData) => {
  try {
    const info = await transporter.sendMail({
      from: '"TrueTrace Security" <security@truetrace.com>',
      to: manufacturerEmail,
      subject: `🚨 Urgent: Counterfeit Report for ${productData.productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Counterfeit Product Reported</h2>
          </div>
          <div style="padding: 20px;">
            <p>A customer has just submitted a counterfeit report for one of your products.</p>
            
            <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Product Details</h3>
            <ul>
              <li><strong>Name:</strong> ${productData.productName}</li>
              <li><strong>Product ID:</strong> ${productData.productId}</li>
              <li><strong>Batch / Serial:</strong> ${productData.batchNumber} / ${productData.serialNumber}</li>
            </ul>

            <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Report Details</h3>
            <ul>
              <li><strong>Reason:</strong> ${reportData.reason}</li>
              <li><strong>Description:</strong> ${reportData.description}</li>
              <li><strong>Location:</strong> ${reportData.location || 'Not provided'}</li>
              <li><strong>Reporter Email:</strong> ${reportData.email || 'Not provided'}</li>
            </ul>
            
            <p style="margin-top: 20px;">Please log into your TrueTrace Manufacturer Dashboard to review this report.</p>
            <a href="http://localhost:5173/manufacturer" style="display: inline-block; background-color: #0f172a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Dashboard</a>
          </div>
        </div>
      `
    });
    
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = {
  sendCounterfeitReportEmail
};
