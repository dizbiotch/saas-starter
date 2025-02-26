'use client';
import { startTransition, use, useActionState } from 'react';
import { useConversation } from '@11labs/react';
import { useCallback } from 'react';
import { useUser } from '@/lib/auth';
import { useSearchParams } from 'next/navigation';
import { getUserOffInterview, getOneCandidate } from '@/app/(login)/actions';

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

  const searchParams = useSearchParams();
  const intervee = searchParams?.get('user');
  

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      if(intervee){
        user1 = await getUserOffInterview(intervee);
        const candidate = await getOneCandidate(intervee);
        CandidateName = candidate.name ?? '';
      }
      console.log(user1?.ColdCallPrompt);
      // Start the conversation with your agent
      await conversation.startSession({
        agentId: 'sEqbEPthhvQ2SvcUAd7z', // Replace with your agent ID

        dynamicVariables: {
          InterviewQuestions: user1?.ColdCallPrompt ?? '',
          Interviewee: CandidateName ?? '',
                  },
      });
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
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected'}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Start Conversation
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Stop Conversation
        </button>
      </div>

      <div className="flex flex-col items-center">
        <p>Status: {conversation.status}</p>
        <p>Agent is {conversation.isSpeaking ? 'speaking' : 'listening'}</p>
      </div>
    </div>
  );
}


