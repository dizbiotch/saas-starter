'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createCandidate,getCandidates } from '@/app/(login)/actions';
import { useUser } from '@/lib/auth';

export default function CandidatesPage() {

  const { userPromise } = useUser();
    const user = use(userPromise);

  interface Candidate {
    
    name: string;
    email: string;
    phone: string;
    status: string;
    rating: string;
    userId: string;
    lastModified: Date;
  }

  enum Status {
    Pending = 'Pending',
    Completed = 'Completed',
  }



  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(Status.Pending);
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState('-');
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    async function fetchCandidates() {
      if (user) {
        const data = await getCandidates(user.id);
        const formattedData = data.map(candidate => ({
          ...candidate,
          userId: candidate.id.toString(),
          lastModified: new Date(candidate.updatedAt),
          name: candidate.name ?? '', // Handle null name
        })).map(candidate => ({
          ...candidate,
          lastModified: candidate.lastModified.getTime() ? new Date() : candidate.lastModified
        }));
        setCandidates(formattedData);
      }
    }
    fetchCandidates();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCandidate: Candidate = {
      name,
      email,
      phone,
      status,
      rating,
      userId: (candidates.length + 1).toString(),
      lastModified: new Date(),
    };
    setCandidates([...candidates, newCandidate]);
    setName('');
    setEmail('');
    setStatus(Status.Pending);
    setRating('5');
    createCandidate(parseInt(newCandidate.userId), newCandidate); // Uncomment this line if you define the createCandidate function
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Candidates Table</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-2 border rounded"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 border rounded"
                required
              />
                
              <input
                type="phone"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="px-4 py-2 border rounded"
                required
              />
                <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => console.log(new Date().toDateString())}
                >
                Add Candidate
                </button>
            </div>
          </form>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Rating
                </th>
                {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Completed Date
                </th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200" id="candidates">
              {candidates.map((candidate) => (
                <tr key={candidate.userId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{candidate.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.rating}</td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.lastModified.toDateString()}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
