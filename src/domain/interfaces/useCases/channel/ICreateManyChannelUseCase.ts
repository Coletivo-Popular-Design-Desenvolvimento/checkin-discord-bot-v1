import { CreateChannelInput } from "./IUpdateChannelUseCase";


export default interface ICreateManyChannelUseCase {
    executeAsync(channels: CreateChannelInput[]): Promise<boolean>
}