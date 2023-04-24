import { WebSocketServer } from 'ws';
import ServerAgent from './ServerAgent';

const wss = new WebSocketServer({ port: 8080 });

const agents: {
  [id: string]: ServerAgent
} = {};

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', async function message(data) {
    const parsedData = JSON.parse(data.toString());

    if (parsedData.type === 'create_agent') {
      console.log(`Creating Agent: ${parsedData.agent_id}`);

      const newAgentId = parsedData.agent_id;
      
      if(agents[newAgentId]) {
        ws.send(JSON.stringify({ type: 'agent_created', success: false, message: `Agent with id ${newAgentId} already exists` }));
      
        return;
      }
      
      agents[newAgentId] = new ServerAgent(newAgentId);
      
      ws.send(JSON.stringify({ type: 'agent_created', success: true, agent_id: newAgentId, message: `Agent with id ${newAgentId} created` }));
    } else if (parsedData.type === 'requestNextMove') {
      const agentId = parsedData.agent_id;
      
      console.log(`requestNextMove message for agent: ${agentId}`);
      
      if (agents[agentId]) {
        const completion = await agents[agentId].processMessage(parsedData);
      
        ws.send(JSON.stringify({ type: 'nextMove', agent_id: agentId, data: completion }));
      } else {
        ws.send(JSON.stringify({ type: 'error', message: `Agent with id ${agentId} not found` }));
      }
    }
  });
});