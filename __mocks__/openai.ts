// __mocks__/openai.ts
export default class OpenAI {
  chat = {
    completions: {
      create: async () => ({
        choices: [
          { message: { role: 'assistant', content: 'Mocked AI response.' } }
        ]
      })
    }
  };
}
