'use client';
import { useCallback, useState } from 'react';
import { useConversation } from '@11labs/react';
import { useUser } from '@/lib/auth';
import { useSearchParams } from 'next/navigation';
import { getUserOffInterview, getOneCandidate, updateCandidatesConversationID, updateChatGPTFeedback } from '@/app/(login)/actions';
import { getGradebyChatGPT } from './api/elevenlabsAPI';

interface ConversationProps {
  candidateName: string;
}

export function ConversationSimple({ candidateName }: ConversationProps) {
  const user = useUser();
  interface ConversationMessage {
    text: string;
    timestamp: number;
  }

  interface ConversationError {
    message: string;
    code: number;
  }

  interface ConversationHandlers {
    onConnect: () => void;
    onDisconnect: () => void;
    onMessage: (message: ConversationMessage) => void;
    onError: (error: ConversationError) => void;
  }

  const conversation: ReturnType<typeof useConversation> = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message: ConversationMessage) => console.log('Message:', message),
    onError: (error: ConversationError) => console.error('Error:', error),
  });

  



  const startConversation = useCallback(async () => {
    try {
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
   
      // Start the conversation with your agent
      console.log(candidateName);
      const conversationId = await conversation.startSession({
        agentId: 'sEqbEPthhvQ2SvcUAd7z', // Replace with your agent ID
        
        dynamicVariables: {
          InterviewQuestions: '1. How would you handle a difficult customer?\n2. Describe a time you provided excellent customer service\n3. How would you personalize the delivery experience?\n4. Can you work well with others?\n.5. Can you describe a time you worked in a team to deliver results?\n6. What team culture would you create at Amazon?',
          Interviewee: candidateName ?? '',
          // IntervieweeEmail: CandidateEmail ?? '',
          
                  },
      });
     
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation, user]);

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
            await new Promise(resolve => setTimeout(resolve, 5000));
           
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
      <p className="text-lg font-semibold">Agent is <span className="text-blue-500">{conversation.status === 'disconnected' ? 'disconnected' : (conversation.isSpeaking ? 'speaking' : 'listening')}</span></p>
    </div>
  </div>
);
}




