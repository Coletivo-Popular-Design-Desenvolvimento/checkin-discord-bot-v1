import { MessageEntity } from '../../domain/entities/Message';
import { ILoggerService } from '../../domain/interfaces/services/ILogger';
import { PrismaService } from '../../infrastructure/persistence/prisma/prismaService';
import { MessageRepository } from '../../infrastructure/persistence/repositories/MessageRepository';
import { mockDbMessageValue, mockMessageValue } from '../config/constants';

import { prismaMock } from "../config/singleton";

describe('MessageRepository', () => {
    let messageRepository: MessageRepository;
    const prismaServiceMock = new PrismaService(prismaMock);
    beforeAll(() => {
        const mockLogger: ILoggerService = {
            logToConsole: jest.fn(),
            logToDatabase: jest.fn(),
        };
        mockLogger.logToConsole = jest.fn().mockImplementation((message) => {
            console.error(message); // Simulate logging to console.error
        });
        messageRepository = new MessageRepository(prismaServiceMock, mockLogger);
    });

    describe('findById', () => {
        it('should return a message by id', async () => {
            const id = 1;

            prismaMock.message.findUnique.mockResolvedValue(mockDbMessageValue);

            const message = await messageRepository.findById(id);

            expect(prismaMock.message.findUnique).toHaveBeenCalledTimes(1);
            expect(prismaMock.message.findUnique).toHaveBeenCalledWith({
                where: { id }
            });

            expect(message).toHaveProperty('id', 1);
            expect(message).toHaveProperty('discordId', mockMessageValue.discordId);
        });

        it('should return null when no message is found', async () => {
            const id = 3;

            prismaMock.message.findUnique.mockResolvedValue(null);

            const message = await messageRepository.findById(id);

            expect(prismaMock.message.findUnique).toHaveBeenCalledTimes(1);
            expect(prismaMock.message.findUnique).toHaveBeenCalledWith({
                where: { id }
            });

            expect(message).toBeNull();
        });
    });

    
    describe('findByChannelId', () => {
        it('should return a list of active messages by channel id', async () => {
            const channelId = mockMessageValue.channelId;

            prismaMock.message.findMany.mockResolvedValue([mockDbMessageValue]);

            const messages = await messageRepository.findByChannelId(channelId);

            expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
            expect(prismaMock.message.findMany).toHaveBeenCalledWith({
                where: { channel_id: channelId, is_deleted: false }
            });

            expect(messages).toHaveLength(1);
            expect(messages[0]).toHaveProperty('id', 1);
            expect(messages[0]).toHaveProperty('channelId', mockMessageValue.channelId);
        });

        it('should return a list of all messages by channel id', async () => {
            const channelId = mockMessageValue.channelId;

            prismaMock.message.findMany.mockResolvedValue([mockDbMessageValue]);

            const messages = await messageRepository.findByChannelId(channelId, true);

            expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
            expect(prismaMock.message.findMany).toHaveBeenCalledWith({
                where: { channel_id: channelId }
            });

            expect(messages).toHaveLength(1);
            expect(messages[0]).toHaveProperty('id', 1);
            expect(messages[0]).toHaveProperty('channelId', mockMessageValue.channelId);
        });

        it('should return empty array when no message is found', async () => {
            const channelId = 23232676;

            prismaMock.message.findMany.mockResolvedValue([]);

            const message = await messageRepository.findByChannelId(channelId);

            expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
            expect(prismaMock.message.findMany).toHaveBeenCalledWith({
                where: { channel_id: channelId, is_deleted: false }
            });

            expect(message).toHaveLength(0);
        });
    });

    describe('findByDiscordId', () => {
        it('should return a list of active messages by discord id', async () => {
            const discordId = mockMessageValue.discordId;

            prismaMock.message.findMany.mockResolvedValue([mockDbMessageValue]);

            const messages = await messageRepository.findByDiscordId(discordId);

            expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
            expect(prismaMock.message.findMany).toHaveBeenCalledWith({
                where: { discord_id: discordId, is_deleted: false }
            });

            expect(messages).toHaveLength(1);
            expect(messages[0]).toHaveProperty('id', 1);
            expect(messages[0]).toHaveProperty('discordId', mockMessageValue.discordId);
        });

        it('should return a list of all messages by discord id', async () => {
            const discordId = mockMessageValue.discordId;

            prismaMock.message.findMany.mockResolvedValue([mockDbMessageValue]);

            const messages = await messageRepository.findByDiscordId(discordId, true);

            expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
            expect(prismaMock.message.findMany).toHaveBeenCalledWith({
                where: { discord_id: discordId }
            });

            expect(messages).toHaveLength(1);
            expect(messages[0]).toHaveProperty('id', 1);
            expect(messages[0]).toHaveProperty('discordId', mockMessageValue.discordId);
        });

        it('should return empty array when no message is found', async () => {
            const discordId = '23232687576';

            prismaMock.message.findMany.mockResolvedValue([]);

            const message = await messageRepository.findByDiscordId(discordId);

            expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
            expect(prismaMock.message.findMany).toHaveBeenCalledWith({
                where: { discord_id: discordId, is_deleted: false }
            });

            expect(message).toHaveLength(0);
        });
    });
    
    describe('findByUserId', () => {
        it('should return a list of active messages by user id', async () => {
            const userId = mockMessageValue.userId;

            prismaMock.message.findMany.mockResolvedValue([mockDbMessageValue]);

            const messages = await messageRepository.findByUserId(userId);

            expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
            expect(prismaMock.message.findMany).toHaveBeenCalledWith({
                where: { user_id: userId, is_deleted: false }
            });

            expect(messages).toHaveLength(1);
            expect(messages[0]).toHaveProperty('id', 1);
            expect(messages[0]).toHaveProperty('userId', mockMessageValue.userId);
        });

        it('should return a list of all messages by user id', async () => {
            const userId = mockMessageValue.userId;

            prismaMock.message.findMany.mockResolvedValue([mockDbMessageValue]);

            const messages = await messageRepository.findByUserId(userId, true);

            expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
            expect(prismaMock.message.findMany).toHaveBeenCalledWith({
                where: { user_id: userId }
            });

            expect(messages).toHaveLength(1);
            expect(messages[0]).toHaveProperty('id', 1);
            expect(messages[0]).toHaveProperty('userId', mockMessageValue.userId);
        });

        it('should return empty array when no message is found', async () => {
            const userId = 23232676;

            prismaMock.message.findMany.mockResolvedValue([]);

            const messages = await messageRepository.findByUserId(userId);

            expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
            expect(prismaMock.message.findMany).toHaveBeenCalledWith({
                where: { user_id: userId, is_deleted: false }
            });

            expect(messages).toHaveLength(0);
        });
    });

    describe('create', () => {
        const today = new Date();
        const messageToCreate: Omit<MessageEntity,'id'> = {
            ...mockMessageValue,
            discordCreatedAt: today,
            createdAt: today,
        }

        it('should insert into db a new message', async () => {
            prismaMock.message.create.mockResolvedValue(mockDbMessageValue);
            
            const newMessage = await messageRepository.create(messageToCreate);

            expect(newMessage).toHaveProperty('id', 1);
        });

        it('should NOT new message insert into db if an error occurs', async () => {
            const error = new Error('could not create');
            prismaMock.message.create.mockRejectedValue(error);

            const spy = jest.spyOn(console, "error").mockImplementation(() => {});

            await messageRepository.create(messageToCreate);
            
            expect(spy).toHaveBeenCalledWith("ERROR");
        })
    })
})