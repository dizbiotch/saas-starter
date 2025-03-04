'use client';

import React, {  use, useActionState, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/lib/auth';
import { updateAccount, createCandidate, getCandidates, sendEmail, getTeamForUser } from '@/app/(login)/actions';
import { get } from 'http';

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

  useEffect(() => {
    async function fetchTeamData() {
      if (user) {
        const data = await getTeamForUser(user.id);
        setTeamdata(data);
      }
    }
    fetchTeamData();
  }, [user]);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAccount,
    { error: '', success: '' }
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(Status.Pending);
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState('-');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

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
  }, [user]);

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
      ChatGPTFeedBack: '',
    };
    setCandidates([...candidates, newCandidate]);
    createCandidate(parseInt(newCandidate.userId), newCandidate); // Uncomment this line if you define the createCandidate function
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
                className="bg-white text-blue-500 border border-blue-500 font-bold"
                onClick={() => window.location.href = '/dashboard/coldsalescall'}
              >
                Customize
              </Button>
              <Button
                className="bg-blue-500 text-white font-bold"
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              if (teamdata && teamdata?.subscriptionStatus === null && candidates.length >= 2) {
                alert('Free subscription allows only 2 candidates.');
                return;
              }
              console.log(new Date().toDateString());
              sendEmail(email, name, 'GetNerva', email);
            }}
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
                </tr>
                {expandedCandidate === candidate.userId && (
            <tr>
              <td colSpan={4} className="px-6 py-4 whitespace text-sm text-gray-900">
                <div className="bg-gray-100 p-4 rounded">
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
