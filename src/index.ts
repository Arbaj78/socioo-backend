import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
// Render apne aap PORT environment variable set karta hai
const port = process.env.PORT || 3000; 

// === CORS Configuration ===
// Hum bata rahe hain ki sirf hamari frontend website hi is API ko call kar sakti hai
const corsOptions = {
  origin: 'https://socioo.org' 
};

app.use(cors(corsOptions));

// Hamara API route
app.get('/api/v1/account', async (req, res) => {
  const accountId = req.query.account_id;

  if (!accountId) {
    return res.status(400).json({ error: 'account_id parameter is required' });
  }

  const n8nWebhookUrl = `https://n8n.srv871973.hstgr.cloud/webhook/socioo_account?account_id=${accountId}`;

  try {
    console.log(`Forwarding request to: ${n8nWebhookUrl}`);
    const n8nResponse = await axios.get(n8nWebhookUrl);
    res.status(n8nResponse.status).json(n8nResponse.data);
  } catch (error: any) {
    console.error('Error calling n8n webhook:', error.message);
    const status = error.response ? error.response.status : 500;
    const data = error.response ? error.response.data : { error: 'An internal server error occurred' };
    res.status(status).json(data);
  }
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

