import express, { Request, Response } from 'express';
import axios from 'axios';
import cors, { CorsOptions } from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// === CORS Configuration ===
const allowedOrigins = [
  'https://socioo.org',
  'http://localhost:5173'
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Note: 'origin' can be undefined for server-to-server requests or same-origin requests
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));

// === API Route ===
app.get('/api/v1/account', async (req: Request, res: Response) => {
  const accountId = req.query.account_id as string;

  if (!accountId) {
    return res.status(400).json({ error: 'account_id parameter is required' });
  }

  const n8nWebhookUrl = `https://n8n.srv871973.hstgr.cloud/webhook/socioo_account?account_id=${accountId}`;

  try {
    console.log(`Forwarding request to: ${n8nWebhookUrl}`);
    const n8nResponse = await axios.get(n8nWebhookUrl);
    res.status(n8nResponse.status).json(n8nResponse.data);
  } catch (error: any) {
    // === BEHTAR ERROR LOGGING ===
    console.error('Error calling n8n webhook:');
    if (error.response) {
      // Agar n8n server ne error ke saath response diya (e.g., 404, 503)
      console.error('Data:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      // Agar request bheji gayi lekin koi response nahi mila (e.g., timeout)
      console.error('Request Error:', error.request);
    } else {
      // Koi aur galti hui
      console.error('General Error:', error.message);
    }

    const status = error.response ? error.response.status : 500;
    const data = error.response ? error.response.data : { error: 'An internal server error occurred' };
    res.status(status).json(data);
  }
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

