import express, { Request, Response } from 'express';
import axios from 'axios';
import cors, { CorsOptions } from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// === YAHAN BADLAAV KIYA GAYA HAI ===

// 1. Allowed origins ki ek list (array) banayein
const allowedOrigins = [
  'https://socioo.org',      // Aapki live frontend website
  'http://localhost:5173'    // Aapka local development server
];

// 2. CORS options me is list ka istemal karein
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Agar request allowedOrigins ki list me hai, to use allow karein
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

// 3. Naye options ke saath CORS ko enable karein
app.use(cors(corsOptions));


// Hamara API route (isme koi badlaav nahi)
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
    // Behtar Error Logging
    console.error('Error calling n8n webhook:');
    if (error.response) {
      console.error('Data:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      console.error('Request Error:', error.request);
    } else {
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

