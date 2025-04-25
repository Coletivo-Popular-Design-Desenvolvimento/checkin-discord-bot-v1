import { CreateChannelInput } from "../../interfaces/useCases/channel/ICreateChannelUseCase";

export default class CreateManyChannels {
    async executeAsync(channels: CreateChannelInput[]): Promise<boolean> {
        throw new Error("method not implemented");
    }
}