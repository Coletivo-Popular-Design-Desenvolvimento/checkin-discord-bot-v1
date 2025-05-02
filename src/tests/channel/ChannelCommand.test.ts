import { any, mockDeep, MockProxy } from "jest-mock-extended";
import ChannelRepository from "../../infrastructure/persistence/repositories/ChannelRepository"
import CreateChannel from "../../domain/useCases/channel/CreateChannel";
import FindChannel from "../../domain/useCases/channel/FindChannel"
import UpdateChannelUseCase from "../../domain/useCases/channel/UpdateChannel"
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import { UserRepository } from "../../infrastructure/persistence/repositories/UserRepository";
import { ErrorMessages } from "../../domain/types/ErrorMessages";

const mockChannelValue = {
    id: 1,
    discordId: 'ASDHJQIUWYEHQ',
    name: 'WASDSWEQEWSADWA',
    url: 'http://dicord/teste/123/456',
    createAt: new Date()
}

const mockChannelValue2 = {
    id: 2,
    discordId: 'ASDHJQIUWYEHQ',
    name: 'WASDSWEQEWSADWA',
    url: 'http://dicord/teste/123/456',
    createAt: new Date()
}

describe("Channel useCases", () => {
    let channelRepository: MockProxy<ChannelRepository>;
    let createUseCase: CreateChannel;
    let updateChannelUseCase: UpdateChannelUseCase
    beforeEach(() => {
        const mockLogger: ILoggerService = {
            logToConsole: jest.fn(),
            logToDatabase: jest.fn(),
        };
        channelRepository = mockDeep<ChannelRepository>();
        createUseCase = new CreateChannel(channelRepository, mockLogger);
        updateChannelUseCase = new UpdateChannelUseCase(channelRepository, mockLogger);
    });

    describe("createChannel", () => {
        it("should create new channel", async () => {
            //ARRANGE
            channelRepository.createAsync.mockResolvedValue(mockChannelValue);
            channelRepository.findByDiscordIdAsync.mockResolvedValue(mockChannelValue);
            //ACT
            const adjustedChannel = {...mockChannelValue};
            const result = await createUseCase.executeAsync(adjustedChannel)
            //ASSERT
            expect(result).toEqual({ Success: true, data: adjustedChannel });
            expect(channelRepository.createAsync).toHaveBeenCalledWith({
                ...channelRepository, id: undefined, 
            });
        });

        it("should return existing user", async () => {
            channelRepository.findByDiscordIdAsync.mockResolvedValue(mockChannelValue2);
        
            const result = await createUseCase.executeAsync(mockChannelValue2);
        
            expect(result).toEqual({
                success: false,
                data: mockChannelValue2,
                message: ErrorMessages.UNKNOWN_ERROR,
            });
            expect(channelRepository.findByDiscordIdAsync).toHaveBeenCalledTimes(1);
            expect(channelRepository.findByDiscordIdAsync).toHaveBeenCalledWith(
            mockChannelValue2.discordId, true);
        });
    });
});