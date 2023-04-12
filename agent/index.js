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
      const prompt = `You are simulating an agent existing in a 2 Dimensional world. You can move up, down, left, and right. You are given a description of your nearby surroundings.  The world extends farther than these surroundings.
        Here is a description of your surroundings:

        ${parsedData.surroundings}

        Provide your next action in the form of a JSON object with the following properties:

        {
          action: {
            type: "move",
            direction: "up" | "down" | "left" | "right"
          }
        }
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
