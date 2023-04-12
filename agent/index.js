import { WebSocketServer } from 'ws';
import { Configuration, OpenAIApi } from "openai";
import extract from "extract-json-from-string";

const configuration = new Configuration({
  apiKey: "***REMOVED***",
});
const openai = new OpenAIApi(configuration);

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('New Connection')
  ws.on('error', console.error);

  ws.on('message', async function message(data) {
    const parsedData = JSON.parse(data);
    console.log('new message ', parsedData.surroundings)
    try {
      const prompt = `# Introduction

      You are acting as an agent living in a simulated 2 dimensional universe. Your job is to exist as best as you see fit.
      
      # Capabilities
      
      You have a limited set of capabilities. They are listed below:
      
      * Move
      * Wait
      
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

      ${JSON.stringify(parsedData.surroundings)}

      The JSON response indicating the next move is:
      `

      const completion = await callOpenAI(prompt, 0);

      wss.clients.forEach(function each(client) {
        client.send(JSON.stringify(completion));
      });

    } catch (error) {
      console.error("Error processing GPT-3 response:", error);
    }
  })

  ws.send('something');
});

async function callOpenAI(prompt, attempt) {
  if (attempt > 3) {
    return null;
  }

  if (attempt > 0) {
    prompt = "YOU MUST ONLY RESPOND WITH VALID JSON OBJECTS\N" + prompt;
  }

  console.log('Calling OpenAI', attempt)

  // Fake openai response delayed by 1 second
  // const response = await new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve({
  //       data: {
  //         choices: [
  //           {
  //             message: {
  //               content: `{
  //                 "action": {
  //                   "type": "move",
  //                   "direction": "up"
  //                 }
  //               }`
  //             }
  //           }
  //         ]
  //       }
  //     })
  //   }, 1000)
  // })

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  console.log('OpenAI response', response.data.choices[0].message.content)

  const responseObject = cleanAndProcess(response.data.choices[0].message.content);
  if (responseObject) {
    return responseObject;
  }

  return await callOpenAI(prompt, attempt + 1);
}

function cleanAndProcess(text) {
  const extractedJson = extract(text)[0];

  if (!extractedJson) {
    return null;
  }

  const { action } = extractedJson;
  if (action && action.type === "move" && ["up", "down", "left", "right"].includes(action.direction)) {
    return extractedJson;
  }

  return null;
}
