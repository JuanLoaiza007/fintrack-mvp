export const convertMock = jest.fn().mockResolvedValue({ text: "Texto de prueba" });

export class ElevenLabsClient {
  constructor() {
    this.speechToText = {
      convert: convertMock,
    };
  }
}