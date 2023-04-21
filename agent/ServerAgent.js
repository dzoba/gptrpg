import {Configuration, OpenAIApi} from "openai";
import {ConversationChain} from "langchain/chains";
import {ChatOpenAI} from "langchain/chat_models/openai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import {BufferMemory} from "langchain/memory";

import env from "./env.json" assert {type: "json"};

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});
let delayTime = process.env.REACT_APP_SERVER_DELAY
if (!delayTime)
  delayTime = 2000;
let reqTime = 0;

const openai = new OpenAIApi(configuration);

class ServerAgent {
  constructor(id) {
    this.id = id;
    const chat = new ChatOpenAI({
        openAIApiKey: env.OPENAI_API_KEY,
        temperature: 0.9,
        maxTokens: 400
      }
    );

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
          `# Introduction

          You are acting as an agent living in a simulated 2 dimensional universe. Your goal is to exist as best as you see fit, explore your living environment, don't live a boring life and meet your needs.
          
          # Capabilities
          
          You have a limited set of capabilities. They are listed below:
          
          * Move (direction: up | down | left | right)
          * Wait
          * Navigate (x: navigate to coordinate x, y: navigate to coordinate y)
          * Sleep
    
          # Reason
          
          You need to provide reason why you choose that action in "reason"
    
          # Responses
          
          You must supply your responses in the form of valid JSON objects.  Your responses will specify which of the above actions you intend to take.  The following is an example of a valid response:
          
          {{
            "action": {{
              "type": "navigate",
              "x": 5,
              "y": 10
            }},
            "reason": "I want to explorer what outside here"
          }}
          
          # Perceptions
          
          You will have access to data to help you make your decisions on what to do next.

          The JSON response indicating the next move is.
          And please use wait less as less possible
          `
      ),
      new MessagesPlaceholder(id),
      HumanMessagePromptTemplate.fromTemplate(`
        For now, this is the information you have access to:
        {status}

        You must supply your responses in the form of valid JSON objects.  Your responses will specify which of the above actions you intend to take.  The following is an example of a valid response:
          
        {{"action":{{"type":"navigate","x":5,"y":10}},"reason":"I want to explorer what outside here"}}`),
    ]);
    this.chain = new ConversationChain({
      memory: new BufferMemory({ returnMessages: true, memoryKey: id }),
      prompt: chatPrompt,
      llm: chat,
    });
    console.log("Current cooldown time: " + delayTime);
  }

  async processMessage(parsedData) {
    try {
      if ((Date.now() - reqTime) <= delayTime) {
        console.log("OpenAI resting...");
        return {"action":{"type":"wait"}};
      }
      reqTime = Date.now();

      return await this.callOpenAI(parsedData, 0);

    } catch (error) {
      console.error("Error processing GPT-3 response:", error);
    }
  }

  async callOpenAI(prompt, attempt) {
    if (attempt > 3) {
      return null;
    }
  
    if (attempt > 0) {
      prompt = "YOU MUST ONLY RESPOND WITH VALID JSON OBJECTS\N" + prompt;
    }
    console.log(JSON.stringify(prompt));

    const response = await this.chain.call({
      status: `Position: 
        ${JSON.stringify(prompt.position)}
  
        Surroundings:
        ${JSON.stringify(prompt.surroundings)}
  
        Sleepiness:
        ${prompt.sleepiness} out of 10`
    });

    // const response = await openai.createChatCompletion({
    //   model: "gpt-3.5-turbo",
    //   messages: [{ role: "user", content: prompt }],
    // });

    console.log('OpenAI response', response.response)
  
    const responseObject = this.cleanAndProcess(response.response);
    if (responseObject) {
      return responseObject;
    }
  
    return await this.callOpenAI(prompt, attempt + 1);
  }
  
  cleanAndProcess(text) {
    const extractedJson = JSON.parse(text);
  
    if (!extractedJson) {
      return null;
    }

    return extractedJson;
  }
}

export default ServerAgent;
