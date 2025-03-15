'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ConversationSimple } from '@/components/ui/conversationsimple';
import { sendLeadEmail } from '@/app/(login)/actions';
import { set } from 'zod';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;


export default function FrontPage() {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [candidateName, setCandidateName] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  const handleButtonClick = (industry: string | null) => {
    setSelectedIndustry(industry);
  };
  const [hide, setHide] = useState<boolean>(false);
   
  function setForm(hide: boolean) {
    setHide(hide);
  }

  function setName(value: string) {
    setCandidateName(value);
  }

  return (
  
      
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center lg:justify-end hidden sm:block">
             
                    {!hide && (
                    <div className="relative bg-white shadow-lg rounded-lg overflow-hidden flex">
                      <div className="p-8 flex flex-col justify-center">
                      <h2 className="text-2xl font-bold mb-4">Choose Your Industry</h2>
                      <Button
                        className={`mb-4 ${selectedIndustry === 'Technology' ? 'border-pink-500 border-4' : ''} bg-purple-500 hover:bg-purple-600 text-white`}
                        onClick={() => handleButtonClick(selectedIndustry === 'Technology' ? null : 'Technology')}
                      >
                        Technology
                      </Button>
                      <Button
                        className={`mb-4 ${selectedIndustry === 'Finance' ? 'border-pink-500 border-4' : ''} bg-purple-500 hover:bg-purple-600 text-white`}
                        onClick={() => handleButtonClick(selectedIndustry === 'Finance' ? null : 'Finance')}
                      >
                        Finance
                      </Button>
                      <Button
                        className={`mb-4 ${selectedIndustry === 'Healthcare' ? 'border-pink-500 border-4' : ''} bg-purple-500 hover:bg-purple-600 text-white`}
                        onClick={() => handleButtonClick(selectedIndustry === 'Healthcare' ? null : 'Healthcare')}
                      >
                        Healthcare
                      </Button>
                      <Button
                        className={`mb-4 ${selectedIndustry === 'Education' ? 'border-pink-500 border-4' : ''} bg-purple-500 hover:bg-purple-600 text-white`}
                        onClick={() => handleButtonClick(selectedIndustry === 'Education' ? null : 'Education')}
                      >
                        Education
                      </Button>
                      </div>
                      <div className="hidden lg:flex bg-purple-500 relative items-center justify-center p-35">
                      <img
                        src="images/tessabot.png"
                        alt="TessaBot"
                        className="hidden sm:block h-auto scale-150"
                      />
                      {selectedIndustry && (
                        <div className="absolute inset-0 bg-opacity-75 flex items-center justify-center">
                        <div className="bg-white p-8 rounded-lg shadow-lg">
                          <h2 className="text-2xl font-bold mb-4">Enter Your Details</h2>
                          <form>
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Name
                            </label>
                            <input
                            type="text"
                            id="name"
                            name="name"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Your Name"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                            </label>
                            <input
                            type="email"
                            id="email"
                            name="email"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Your Email"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Button
                            className="bg-purple-500 hover:bg-purple-600 text-white"
                            type="button"
                            onClick={() => {
                              setName((document.getElementById('name') as HTMLInputElement).value);
                              let email = (document.getElementById('email') as HTMLInputElement).value;
                              const name = (document.getElementById('name') as HTMLInputElement).value;
                              sendLeadEmail('prestontomes@gmail.com', name, email, 'Lead from Nerva Ai Services'); // TODO change to Lead generator Email
                              setSelectedIndustry(null); // Hide the form
                              setForm(true);
                            }}
                            >
                            Begin Demo
                            </Button>
                          </div>
                          </form>
                        </div>
                        </div>
                      )}
                      </div>
                    </div>
                    )}
    
      { hide && (
        <Card className="shadow-lg w-full">
          <CardContent>
            <div className="flex ">
              <div className="w-full lg:mr-4 mb-4 lg:mb-0">
          <Card className = "shadow-lg bg-purple-500">
            <CardContent>
              <div className="mb-4">
                <h2 className="text-center text-xl font-semibold text-white">Interviewer</h2>
              </div>
              <div className="h-72 bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden">
                <img src="/images/photo-12.jpg" alt="Bot Picture" className="w-full h-full object-cover" />
              </div>
            </CardContent>
          </Card>
              </div>
              <div className="w-full lg:w-2/3">
          <CardContent>
            <div className="z-10 justify-center font-mono text-sm flex h-full items-center mx-auto mt-30">
              <ConversationSimple candidateName={candidateName} />
            </div>
          </CardContent>
              </div>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 mt-2 mr-2">
          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={() => setForm(false)}
          >
            X
          </Button>
        </div>
        </Card>
       
      )}
    </div>
  );
}
