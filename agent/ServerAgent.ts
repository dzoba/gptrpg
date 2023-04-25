import { Configuration, OpenAIApi } from "openai";
import extract from "extract-json-from-string";

import env from "./env.json";

interface ParsedData {
  agent_id: string;
  position: {
    x: number;
    y: number;
  }
  surroundings: any;
  sleepiness: number;
}

interface ActionResponse {
  action: {
    type: "move" | "wait",
    direction?: "up" | "down" | "left" | "right"
  }
}

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

class ServerAgent {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  async processMessage(parsedData: ParsedData) {
    try {
      const prompt = `# Introduction

      You are acting as an agent living in a simulated 2 dimensional universe. Your goal is to exist as best as you see fit and meet your needs.
      
      # Capabilities
      
      You have a limited set of capabilities. They are listed below:
      
      * Move (up, down, left, right)
      * Wait
      * Navigate (to an x,y coordinate)
      * Sleep

      # Responses
      
      You must supply your responses in the form of valid JSON objects.  Your responses will specify which of the above actions you intend to take.  The following is an example of a valid response:
      
      {
        action: {
          type: "move",
          direction: "up" | "down" | "left" | "right"
        }
      }
      
      # Perceptions
      
      You will have access to data to help you make your decisions on what to do next.
      
      For now, this is the information you have access to:

      Position: 
      ${JSON.stringify(parsedData.position)}

      Surroundings:
      ${JSON.stringify(parsedData.surroundings)}

      Sleepiness:
      ${parsedData.sleepiness} out of 10

      The JSON response indicating the next move is.
      `

      const completion = await this.callOpenAI(prompt, 0);
      return completion;

    } catch (error) {
      console.error("Error processing GPT-3 response:", error);
    }
  }

  async callOpenAI(prompt: string, attempt: number): Promise<ActionResponse | null> {
    if (attempt > 3) {
      return null;
    }
  
    if (attempt > 0) {
      prompt = "YOU MUST ONLY RESPOND WITH VALID JSON OBJECTS\N" + prompt;
    }
  
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
  
    const message = response.data.choices[0].message

    if (!message) {
      console.error('Message is undefined, response: ', response)

      return null
    }

    console.log('OpenAI response', message.content)
  
    const responseObject = this.cleanAndProcess(message.content);
    if (responseObject) {
      return responseObject;
    }
  
    return await this.callOpenAI(prompt, attempt + 1);
  }
  
  cleanAndProcess(text: string) {
    const extractedJson = extract(text)[0];
  
    if (!extractedJson) {
      return null;
    }

    return extractedJson;
  }
}

export default ServerAgent;