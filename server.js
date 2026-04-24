require('dotenv').config();
const express = require('express');
const path = require('path');
const { Resend } = require('resend');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    await resend.emails.send({
      from: 'Click Raft <noreply@updates.click-raft.com>',
      to: 'spencer@click-raft.com',
      replyTo: email.trim(),
      subject: `New inquiry from ${name.trim()} — Click Raft`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:8px;">
          <h2 style="margin:0 0 24px;font-size:20px;color:#080808;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;font-weight:600;color:#333;width:90px;">Name</td>
              <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;color:#555;">${escapeHtml(name.trim())}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;font-weight:600;color:#333;">Email</td>
              <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;">
                <a href="mailto:${escapeHtml(email.trim())}" style="color:#fe4a23;">${escapeHtml(email.trim())}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;font-weight:600;color:#333;vertical-align:top;">Message</td>
              <td style="padding:10px 0;color:#555;white-space:pre-line;">${escapeHtml(message.trim())}</td>
            </tr>
          </table>
          <p style="margin:24px 0 0;font-size:12px;color:#999;">Sent via clickraft.com contact form</p>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ error: 'Failed to send your message. Please try again or email spencer@click-raft.com directly.' });
  }
});

// Fallback — serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`Click Raft server running → http://localhost:${PORT}`);
});
