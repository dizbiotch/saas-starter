'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Conversation } from '@/components/ui/conversation';
import { useRouter } from 'next/router';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export default function BotPage() {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  return (
    <section className="flex flex-col items-center justify-center h-full">
      <h1 className="text-lg lg:text-2xl font-medium text-white mb-6 text-center">
        Interview Call
      </h1>

      <Card className="shadow-lg">
        <CardContent>
          <div className="flex mb-4">
            <div className="flex flex-col w-1/3 mr-4 hidden lg:flex">
                <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-center text-xl lg:text-2xl font-semibold text-gray-800">
                      Interviewer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden">
                      <img src="/images/interviewbot.png" alt="Bot Picture" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300" />
                    </div>
                  </CardContent>
                </Card>
            </div>
            <Card className="flex-2 lg:w-2/3 shadow-md">
              <CardContent>
                <div className="h-full flex flex-col">
                  <div className="flex-1 mb-4">
                    <div className="mb-4">
                    </div>
                    <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
                      <Conversation />
                    </div>
                  </div>
                 
                </div>
                <div className="h-75 mt-4 flex justify-center">
                  <video id="webcam" className="h-full aspect-[4/3] bg-gray-200 rounded-lg shadow-md" autoPlay playsInline></video> 
                  <script>
                  {`
                    navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => {
                    const video = document.getElementById('webcam');
                    if (video) {
                      video.srcObject = stream;
                    }
                    })
                    .catch(error => {
                    console.error('Error accessing webcam:', error);
                    });
                  `}
                  </script>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

