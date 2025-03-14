'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Conversation } from '@/components/ui/conversation';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export default function BotPage() {
  const recognitionRef = useRef<SpeechRecognition | null>(null);


  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Interview Call
      </h1>
      
      <Card>
        <CardContent>
            <div className="flex mb-4">
            <div className="flex flex-col w-1/3 mr-4 hidden lg:flex">
            <Card className="mb-4 shadow-md lg:h-96">
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
            <Card className="flex-2 lg:w-1/3">
              <CardContent>
              <div className="h-full flex flex-col">
              <div className="flex-1 mb-4">
              <div className="mb-4">
              </div>
                <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
                <Conversation />
                </div>
              </div>
              <div className="flex items-center">
            
              </div>
             
              </div>
              <div className="h-75
              ">    <div className="h-75 mt-4 flex justify-center">
                  <video id="webcam" className="h-full aspect-[4/3] bg-gray-200 rounded-lg shadow-md" autoPlay playsInline></video> 
                  </div>
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

