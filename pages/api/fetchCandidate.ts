import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db/drizzle';
import { candidates, apiKeys, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { apiKey, candidateEmail } = req.body;

  if (!apiKey || !candidateEmail) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Verify API key
    const apiKeyOwner = await db.select().from(apiKeys).where(eq(apiKeys.key, apiKey)).limit(1);
    if (apiKeyOwner.length === 0) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    const user = await db.select().from(users).where(eq(users.id, apiKeyOwner[0].userId)).limit(1);
    if (user.length === 0) {
      return res.status(401).json({ message: 'Invalid API key owner' });
    }

    // Fetch candidate data from the owner's database
    const candidate = await db
      .select()
      .from(candidates)
      .where(and(eq(candidates.email, candidateEmail), eq(candidates.userCreator, user[0].id.toString())))
      .limit(1);

    if (candidate.length === 0) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.status(200).json({ 
      message: 'Candidate fetched successfully', 
      candidate: {
        name: candidate[0].name,
        email: candidate[0].email,
        phone: candidate[0].phone,
        status: candidate[0].status,
        rating: candidate[0].rating,
        conversationID: candidate[0].conversationID,
        ChatGPTFeedBack: candidate[0].ChatGPTFeedBack,
        updatedAt: candidate[0].updatedAt,
      }
    });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

