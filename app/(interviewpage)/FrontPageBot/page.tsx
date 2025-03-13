'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ConversationSimple } from '@/components/ui/conversationsimple';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

interface ConversationProps {
  candidateName: string;
}
export default function FrontPage({ candidateName }: ConversationProps) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);


  return (
  
      
      <Card className="shadow-lg w-full">
        <CardContent>
          <div className="flex flex-col lg:flex-row mb-4 w-full" >
        <div className="w-full  lg:mr-4 mb-4 lg:mb-0">
            <Card className="shadow-md h-96 flex flex-col justify-between">
            <CardContent>
              <div className="mb-4">
              <h2 className="text-center text-xl font-semibold text-gray-800">Interviewer</h2>
              </div>
              <div className="h-72 bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden">
              <img src="/images/photo-12.jpg" alt="Bot Picture" className="w-full h-full object-cover" />
              </div>
            </CardContent>
            
            </Card>
        </div>
        <div className="w-full lg:w-2/3"></div>
              <CardContent>
             
                <div className="z-10 justify-center font-mono text-sm flex h-full items-center">
                  <ConversationSimple candidateName={candidateName} />
                </div>
              
           
              </CardContent>
            </div>
          
        </CardContent>
      </Card>
  );
}

