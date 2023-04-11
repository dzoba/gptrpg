import { WebSocketServer } from 'ws';
import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: "***REMOVED***",
});
const openai = new OpenAIApi(configuration);

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('New Connection')
  ws.on('error', console.error);

  ws.on('message', async function message(data) {
   try {
      const prompt = `You are simulating an agent existing in a 2 Dimensional world. You can move up, down, left, and right. You are given a description of your nearby surroundings.  The world extends farther than these surroundings.
        Here is a description of your surroundings:

        ${data.surroundings}

        Provide your next action in the form of a JSON object with the following properties:

        {
          action: {
            type: "move",
            direction: "up" | "down" | "left" | "right"
          }
        }
      `


      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });
      console.log(completion.data.choices[0].message);

      wss.clients.forEach(function each(client) {
        client.send(JSON.stringify(completion.data.choices[0].message.content));
      });


    } catch (error) {
      console.error("Error processing GPT-3 response:", error);
    }


  })

  ws.send('something');
});