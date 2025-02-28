'use server';

const elevellabAPI = process.env.ELEVENLABS_API_KEY || '';
const OpenAIAPI = process.env.OPENAI_API_KEY || '';

export async function getConversationDetails(ConverstationID: string) {
  if (!elevellabAPI) {
    throw new Error("ELEVENLABS_API_KEY is not defined");
  }
  const response = await fetch("https://api.elevenlabs.io/v1/convai/conversations/" + ConverstationID, {
    method: "GET",
    headers: {
      "xi-api-key": elevellabAPI,
    },
  });
  const body = await response.json();
  console.log(body);
  return body;
}

export async function formatInterviewString(conversation: any): Promise<string> {
  const transcript = conversation.transcript;
  let interviewString = '';
  console.log('Transcript:', JSON.stringify(transcript, null, 2)); // Log the transcript in a readable format

  if (transcript && Array.isArray(transcript)) {
    transcript.forEach((entry: any) => {
      if (entry.role && typeof entry.message === 'string') {
        interviewString += `${entry.role === 'agent' ? 'Agent' : 'User'}: ${entry.message}\n`;
      }
    });
  }

  return interviewString;
}

export async function getGradebyChatGPT(conversationID: string) {
  console.log("conversationID: " + conversationID);

  try {
    // Ensure OpenAIAPI key is defined
    if (!OpenAIAPI) {
      throw new Error("OPENAI_API_KEY is not defined");
    }

    // Retrieve and format the transcript
    let transcript = await getConversationDetails(conversationID);
    if (!transcript) {
      throw new Error("Transcript could not be retrieved.");
    }
    
    transcript = await formatInterviewString(transcript);
    console.log("Transcript:", transcript);

    // OpenAI API request
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OpenAIAPI}`,
      },
      body: JSON.stringify({
        model: "gpt-4",  // Use "gpt-3.5-turbo" if needed
        messages: [
          { role: "system", content: "You are an expert interviewer who evaluates interview performance and assigns a grade." },
          { role: "user", content: `Please grade the following interview transcript:\n\n${transcript}` }
        ],
        max_tokens: 150,
      }),
    });

    // Parse API response
    const body = await response.json();
    if (!body.choices || body.choices.length === 0) {
      throw new Error("No response received from OpenAI.");
    }

    console.log("Grading Result: ", body.choices[0].message.content);
    return body.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    return "An error occurred while fetching the grade.";
  }
}


