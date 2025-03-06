import { Button } from '@/components/ui/button';
import { ArrowRight, CreditCard, Database } from 'lucide-react';
import { Terminal } from './terminal';

export default function HomePage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Nerva Ai Services
                <span className="block text-purple-500 text-5xl">AI-Powered Interviews and Insights</span>
              </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Discover how our AI interview program can help you prepare for your next interview. Get personalized feedback, practice questions, and strategies to improve your performance.
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
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center lg:justify-end">
              <img
              src="images/employeephoto.png"
              alt="Two people talking to AI"
              className="rounded-lg shadow-lg w-3/4 h-auto"
              />
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
                AI Interview Trainer
              </h2>
                <p className="mt-2 text-base text-gray-500">
                Leverage AI to get personalized interview training, insights, and
                strategies to improve your interview skills and increase your chances of success.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
              <CreditCard className="h-6 w-6" />
              </div>
              <div className="mt-5">
              <h2 className="text-lg font-medium text-gray-900">
                Ai Driven Insight
              </h2>
                <p className="mt-2 text-base text-gray-500">
                Save time and increase your interview opportunities with AI-powered scheduling and preparation tools. Streamline your process and focus on what matters most - acing your interviews.
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
                Real-Time AI Feedback
                </h2>
             
                <p className="mt-2 text-base text-gray-500">
                Our AI interview trainer provides real-time feedback and suggestions to help you refine your responses and improve your interview performance.
                </p>
              </div>
            </div>

      
          </div>
        </div>
      </section>

      {/* <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <footer className="bg-gray-800 py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                <div>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Contact Us
                </h2>
                <p className="mt-3 max-w-3xl text-lg text-gray-400">
                  Have questions or need help? Reach out to our support team for assistance.
                </p>
                <p className="mt-3 max-w-3xl text-lg text-gray-400">
                  Email: support@yourbusiness.com | Phone: (123) 456-7890
                </p>
                </div>
                <div className="flex justify-end lg:col-span-1 lg:justify-end">
                <img
                  src="images/routeflo.png"
                  alt="Company Logo"
                  className="h-12 w-auto"
                />
                </div>
              </div>
              </div>
            </footer>
           
        </div>
      </section> */}
    </main>
  );
}
