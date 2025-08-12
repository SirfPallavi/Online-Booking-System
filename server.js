const express = require('express');
const path = require('path');

const usermodel = require("./usermodel/schema");


const app = express();
const PORT = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/getData', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      roomType,
      guests,
      specialRequests
    } = req.body;

    const numberOfGuests = parseInt(guests);
    const totalNights = 2;

    let roomRate = 0;
    if (roomType === 'standard') roomRate = 99;
    else if (roomType === 'deluxe') roomRate = 149;
    else if (roomType === 'suite') roomRate = 299;

    const totalAmount = totalNights * roomRate;

    await usermodel.create({
      firstName,
      lastName,
      email,
      phone,
      roomType,
      numberOfGuests,
      specialRequests: specialRequests || '',
      totalNights,
      roomRate,
      totalAmount
    });

    const qrData = encodeURIComponent(`
      Name: ${firstName} ${lastName}
      Email: ${email}
      Phone: ${phone}
      Room: ${roomType}
      Guests: ${numberOfGuests}
      Nights: ${totalNights}
      Total: $${totalAmount}
    `);

    res.status(201).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Confirmation</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(to right, #f7f2ec, #fdfcfb);
            padding: 40px;
            color: #2c3e50;
          }
          .slip-container {
            max-width: 750px;
            margin: auto;
            background: #fff;
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            overflow: hidden;
          }
          .header {
            background-color: #1a237e;
            color: white;
            text-align: center;
            padding: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: 1px;
          }
          .header p {
            margin-top: 10px;
            font-size: 14px;
            color: #dcdcdc;
          }
          .content {
            padding: 30px 40px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding: 12px;
            border-radius: 8px;
            background-color: #f8f9fa;
          }
          .row:nth-child(even) {
            background-color: #eef1f5;
          }
          .label {
            font-weight: 500;
            color: #555;
          }
          .value {
            font-weight: 600;
            color: #111;
          }
          .amount {
            text-align: right;
            background: #f0f4c3;
            font-size: 20px;
            font-weight: 700;
            color: #33691e;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
          }
          .qr {
            text-align: center;
            margin: 30px 0;
          }
          .qr img {
            border: 8px solid #f2f2f2;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }
          .print-btn {
            display: block;
            margin: 20px auto 40px;
            background-color: #f9a825;
            color: #fff;
            padding: 12px 30px;
            font-size: 16px;
            font-weight: 600;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          .print-btn:hover {
            background-color: #f57f17;
          }
          .footer {
            text-align: center;
            font-size: 15px;
            color: #4caf50;
            padding-bottom: 30px;
            font-weight: 500;
          }
          @media print {
            .print-btn {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="slip-container">
          <div class="header">
            <h1>Hotel Booking Confirmation</h1>
            <p>Your stay is confirmed — we look forward to welcoming you</p>
          </div>

          <div class="content">
            <div class="row"><span class="label">Guest Name:</span><span class="value">${firstName} ${lastName}</span></div>
            <div class="row"><span class="label">Email:</span><span class="value">${email}</span></div>
            <div class="row"><span class="label">Phone:</span><span class="value">${phone}</span></div>
            <div class="row"><span class="label">Room Type:</span><span class="value">${roomType.charAt(0).toUpperCase() + roomType.slice(1)}</span></div>
            <div class="row"><span class="label">Guests:</span><span class="value">${numberOfGuests}</span></div>
            <div class="row"><span class="label">Nights:</span><span class="value">${totalNights}</span></div>
            <div class="row"><span class="label">Rate per Night:</span><span class="value">$${roomRate}</span></div>
            <div class="row"><span class="label">Special Requests:</span><span class="value">${specialRequests || 'None'}</span></div>

            <div class="amount">Total Amount: $${totalAmount}</div>

            <div class="qr">
              <img src="/paytm.jpg" alt="QR Code" style="width: 160px; border: 5px solid #eee; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
              <p style="font-size: 13px; color: #777;">Scan to verify your booking</p>
            </div>

            <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
          </div>

          <div class="footer">
            ✅ Details stored successfully!<br />
            Complete payment for Confirm the Booking.
          </div>
        </div>
      </body>
      </html>

    `);
  } catch (error) {
    console.error('❌ Error saving data:', error);
    res.status(500).send('❌ Failed to store booking data.');
  }
});

// Route for home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
