import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db/drizzle';
import { candidates, apiKeys, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createCandidate, fetchCandidates, sendEmail, deleteCandidatebyID, getCandidates } from '@/app/(login)/actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { apiKey, candidate } = req.body;

  if (!apiKey || !candidate) {
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

    // Insert candidate data into the owner's database
    const result = await db
      .insert(candidates)
      .values({
        ...candidate,
        updatedAt: new Date(),
        candidateTable: `candidates_${user[0].id}`,
        userCreator: user[0].id.toString(),
        ChatGPTFeedBack: '', // Add default or appropriate value for ChatGPTFeedBack
      })
      .returning({ id: candidates.id });

    res.status(200).json({ message: 'Candidate added successfully', candidateId: result[0].id });
    const companyName = user[0].companyName ?? '';
    const email = candidate.email;
    await sendEmail(email, candidate.name, companyName, 'GetNerva', email);
  } catch (error) {
    console.error('Error adding candidate:', error);
    res.status(500).json({ message: 'Internal server error'+error });
  }
}

