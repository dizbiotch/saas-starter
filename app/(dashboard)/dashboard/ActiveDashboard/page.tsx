'use client';

import React, { use, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/lib/auth';
import { createCandidate, fetchCandidates, sendEmail, deleteCandidatebyID, getCandidates } from '@/app/(login)/actions';

type ActionState = {
  error?: string;
  success?: string;
};

interface Candidate {
  name: string;
  email: string;
  phone: string;
  status: string;
  rating: string;
  userId: string;
  lastModified: Date;
  ChatGPTFeedBack: string;
}

enum Status {
  Pending = 'Pending',
  Completed = 'Completed',
}

export default function GeneralPage() {
  const { userPromise } = useUser();
      const user = use(userPromise);


  const [teamdata, setTeamdata] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(Status.Pending);
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState('-');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

  let loadCandidates = async () => {
    if (user) {
      const data = await fetchCandidates(user);
      setCandidates(data);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCandidate: Candidate = {
      name,
      email,
      phone,
      status,
      rating,
      userId: (candidates.length + 1).toString(),
      lastModified: new Date(),
      ChatGPTFeedBack: '',
    };
    await createCandidate(parseInt(newCandidate.userId), newCandidate);
    await sendEmail(email, name, user?.companyName ?? '', 'GetNerva', email);
    await loadCandidates();
  };

  const handleDelete = async (userId: string) => {
    await deleteCandidatebyID(parseInt(userId));
    await loadCandidates();
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center">
                <span className="mr-2">🗣️</span> Interview Coach
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Try our interview bot and pre-interview future hires</p>
            <div className="flex justify-between mt-4">
              <Button
                className="bg-white text-purple-500 border border-purple-500 font-bold"
                onClick={() => window.location.href = '/dashboard/coldsalescall'}
              >
                Customize
              </Button>
              <Button
                className="bg-purple-500 text-white font-bold"
                onClick={() => window.location.href = '/dashboard/TalkingWithBot'}
              >
                Play
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hidden lg:block">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Recent activity content goes here...</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Candidates Table</CardTitle>
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
                  className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Actions
                </th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200" id="candidates">
              {candidates
                .sort((a, b) => (a.status === Status.Completed ? -1 : 1))
                .map((candidate) => (
                <React.Fragment key={candidate.userId}>
                  <tr onClick={() => setExpandedCandidate(expandedCandidate === candidate.userId ? null : candidate.userId)} className="cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{candidate.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.rating}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(candidate.userId);
                    }}
                    >
                    Delete
                    </button>
                  </td>
                  </tr>
                  {expandedCandidate === candidate.userId && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 whitespace text-sm text-gray-900">
                    <div className="bg-gray-100 p-4 rounded max-h-40 overflow-y-auto">
                      <p>
                      {candidate.ChatGPTFeedBack.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                        {line}
                        <br />
                        </React.Fragment>
                      ))}
                      </p>
                    </div>
                    </td>
                  </tr>
                  )}
                </React.Fragment>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
