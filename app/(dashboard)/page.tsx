'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, CreditCard, Database } from 'lucide-react';
import { Terminal } from './terminal';
import { useState } from 'react';
import { sendLeadEmail } from '@/app/(login)/actions';
import { Conversation } from '@/components/ui/conversation';
import FrontPage from '@/app/(interviewpage)/FrontPageBot/page';



export default function HomePage() {

 const [name, setName] = useState<string>('');
 const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
const [showBot, setShowBot] = useState<boolean>(false);
 const handleButtonClick = (industry: string | null) => {
   setSelectedIndustry(industry);
 };

 const handleShowBotClick = (Showbot: boolean) => {
  setShowBot(Showbot);
};

 
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Nerva Ai Services
                <span className="block text-purple-500 text-5xl">Custom AI-Powered Interviews and Insights</span>
              </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Enhance your interview process with our customizable AI Interviewers. Engage candidates effectively and streamline your interviews with AI-powered insights and analytics.
                </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <a
                  href="/interviewpage"
                  target="_blank"
                >
                    <Button
                    className="bg-white hover:bg-gray-100 text-black border border-gray-200 rounded-full text-lg px-8 py-4 inline-flex items-center justify-center"
                    >
                    
                    Talk to Demo Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </a>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center lg:justify-end hidden sm:block">
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
                sendLeadEmail('prestontomes@gmail.com', name, email, 'Lead from Nerva Ai Services');//TODO change to Lead generator Email
                handleShowBotClick(true);
                
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
              {showBot && (
            <div className="mt-8 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center lg:justify-end">
              <div className="relative bg-white shadow-lg rounded-lg overflow-hidden flex h-96">
              {showBot && <FrontPage key={selectedIndustry} candidateName={name} />}
              </div>
              </div>
              )}
            </div>
           
             
            
          </div>
        </div>
      </section>

      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
              <svg viewBox="0 0 24 24" className="h-6 w-6">
                <path
                fill="currentColor"
                d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14.93V17h-2v-2h2v1.93a8.001 8.001 0 01-6.93-6.93H7v-2H5.07A8.001 8.001 0 0112 4.07V5h2V3h-1.93a8.001 8.001 0 016.93 6.93H17v2h1.93A8.001 8.001 0 0113 16.93z"
                />
              </svg>
              </div>
              <div className="mt-5">
              <h2 className="text-lg font-medium text-gray-900">
                Custom AI Interviewer
              </h2>
                <p className="mt-2 text-base text-gray-500">
                Interview more candidates and reduce job turnover with our AI-driven insights and AI-powered custom Interviewer. Optimize your hiring process and retain top talent with data-backed strategies.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
              <CreditCard className="h-6 w-6" />
              </div>
              <div className="mt-5">
              <h2 className="text-lg font-medium text-gray-900">
                AI Driven Insight
              </h2>
                <p className="mt-2 text-base text-gray-500">
                Our AI-driven insights provide a comprehensive analysis of candidate responses, highlighting key strengths and areas for improvement. This allows you to make data-informed decisions, ensuring you select the best candidates for your organization.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                <svg viewBox="0 0 24 24" className="h-6 w-6">
                <path
                  fill="currentColor"
                  d="M6.62 10.79a15.91 15.91 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.36 11.36 0 003.58.61 1 1 0 011 1v3.78a1 1 0 01-1 1A16 16 0 013 4a1 1 0 011-1h3.78a1 1 0 011 1 11.36 11.36 0 00.61 3.58 1 1 0 01-.27 1.11l-2.2 2.2z"
                />
                </svg>
                </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                Reduce No-Shows
                </h2>
                <p className="mt-2 text-base text-gray-500">
                Save money by reducing no-shows and interview more candidates efficiently with our AI-powered platform. Focus on the best candidates and streamline your hiring process.
                </p>
              </div>
            </div>

      
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl text-center">
            How It Works
          </h2>
          <div className="mt-8 flex justify-center">
            <video controls className="w-full max-w-3xl rounded-lg shadow-lg">
              <source src="videos/how-it-works.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              {
              step: "Candidate Scheduled",
              subtext: "Candidate is scheduled for an interview in your ATS"
              },
              {
              step: "Notification Sent",
              subtext: "Our system notifies the candidate of the interview"
              },
              {
              step: "Interview Completed",
              subtext: "Candidate completes the AI-powered interview"
              },
              {
              step: "Score Generated",
              subtext: "AI analyzes the interview and generates a comprehensive score"
              },
              {
              step: "Result Posted",
              subtext: "Detailed analysis is posted to the candidate's ATS profile"
              },
            ].map((item, index) => (
              <div key={index} className="text-center transition-transform transform hover:scale-105">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white text-purple-500 border border-purple-500 mx-auto transition-transform transform hover:scale-125">
              <span className="text-lg font-bold">{index + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 transition-transform transform hover:scale-105">{item.step}</h3>
              <p className="mt-2 text-base text-gray-500">{item.subtext}</p>
              </div>
            ))}
            </div>
            <div className="mt-12 flex justify-center">
              <a
                href="/interviewpage"
                target="_blank"
              >
                <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-full text-lg px-8 py-4 inline-flex items-center justify-center">
                  See It In Action
                </Button>
              </a>
            </div>
        </div>
      </section>

    </main>
  );
}
