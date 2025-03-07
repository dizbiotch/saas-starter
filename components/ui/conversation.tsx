'use client';
import { startTransition, use, useActionState } from 'react';
import { useConversation } from '@11labs/react';
import { useCallback } from 'react';
import { useUser } from '@/lib/auth';
import { useSearchParams } from 'next/navigation';
import { getUserOffInterview, getOneCandidate,updateCandidatesConversationID,getCandidatesConversationID, updateChatGPTFeedback } from '@/app/(login)/actions';
import { getGradebyChatGPT } from './api/elevenlabsAPI';

export function Conversation() {
  interface ConversationMessage {
    text: string;
    sender: string;
  }

  interface ConversationError {
    message: string;
  }

  interface UseConversationOptions {
    onConnect: () => void;
    onDisconnect: () => void;
    onMessage: (message: ConversationMessage) => void;
    onError: (error: ConversationError) => void;
  }

  interface Conversation {
    startSession: (options: { agentId: string; dynamicVariables?: { [key: string]: string } }) => Promise<string>;
    endSession: () => Promise<void>;
    status: 'connected' | 'disconnected' | 'connecting' | 'disconnecting';
    isSpeaking: boolean;
  }

  const user = useUser();
  const conversation: Conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message: ConversationMessage) => console.log('Message:', message),
    onError: (error: ConversationError) => console.error('Error:', error),
  });

  const { userPromise } = useUser();
  let user1 = use(userPromise);
  let CandidateName = '';
  let CandidateEmail = '';
  let conversationId = '';
  const searchParams = useSearchParams();
  const intervee = searchParams?.get('user');

  const fetchAndGradeConversation = useCallback(async (email: string) => {
    try {
      let candidate = await getOneCandidate(email);
      const gptGrade = await getGradebyChatGPT(candidate.conversationID);
      updateChatGPTFeedback(email, gptGrade);
      console.log(gptGrade);
    } catch (error) {
      console.error('Failed to fetch and grade conversation:', error);
    }
  }, []);

 

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      if(intervee){
        user1 = await getUserOffInterview(intervee);
        const candidate = await getOneCandidate(intervee);
        CandidateName = candidate.name ?? '';
        CandidateEmail = candidate.email ?? '';
      }
      console.log(user1?.ColdCallPrompt);
      // Start the conversation with your agent
      const conversationId = await conversation.startSession({
        agentId: 'sEqbEPthhvQ2SvcUAd7z', // Replace with your agent ID

        dynamicVariables: {
          InterviewQuestions: user1?.ColdCallPrompt ?? '1. How would you handle a difficult customer?\n2. Describe a time you provided excellent customer service\n3. How would you personalize the delivery experience?\n4. Can you work well with others?\n.5. Can you describe a time you worked in a team to deliver results?\n6. What team culture would you create at Amazon?',
          Interviewee: CandidateName ?? '',
          IntervieweeEmail: CandidateEmail ?? '',
          
                  },
      });
      if(CandidateEmail!==""){
      updateCandidatesConversationID(CandidateEmail, conversationId);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation, user, intervee]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
   
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
      {/* <Button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"> */}
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected'}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 text-lg"
        >
          Start Conversation
        </button>
        <button
          onClick={async () => {
            await stopConversation();
            if (intervee) {
              await new Promise(resolve => setTimeout(resolve, 5000));
              await fetchAndGradeConversation(intervee);
            }
          }}
          disabled={conversation.status !== 'connected'}
          className={`${
            conversation.status !== 'connected' ? 'bg-gray-400' : 'bg-orange-600 hover:bg-red-700'
          } text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 text-lg`}
        >
          Stop Conversation
        </button>
      </div>
      

      <div className="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-md">
        <p className="text-lg font-semibold">Agent Status: <span className="text-blue-500">{conversation.status}</span></p>
        <p className="text-lg font-semibold">Agent is <span className="text-blue-500">{conversation.isSpeaking ? 'speaking' : 'listening'}</span></p>
      </div>
    </div>
  );
}


