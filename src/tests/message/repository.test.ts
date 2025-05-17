import { MessageEntity } from '../../domain/entities/Message';
import { ILoggerService } from '../../domain/interfaces/services/ILogger';
import { LoggerContextStatus } from '../../domain/types/LoggerContextEnum';
import { PrismaService } from '../../infrastructure/persistence/prisma/prismaService';
import { MessageRepository } from '../../infrastructure/persistence/repositories/MessageRepository';
import { mockDbMessageValue, mockMessageUpdateValue, mockMessageValue } from '../config/constants';

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
        it('should return a message by discord id', async () => {
            const discordId = mockMessageValue.discordId;

            prismaMock.message.findFirst.mockResolvedValue(mockDbMessageValue);

            const message = await messageRepository.findByDiscordId(discordId);

            expect(prismaMock.message.findFirst).toHaveBeenCalledTimes(1);
            expect(prismaMock.message.findFirst).toHaveBeenCalledWith({
                where: { discord_id: discordId }
            });

            expect(message).toHaveProperty('id', 1);
            expect(message).toHaveProperty('discordId', mockMessageValue.discordId);
        });

        it('should not return message if error occurs', async () => {
            const discordId = '23232687576';

            prismaMock.message.findFirst.mockRejectedValue(new Error());

            const spy = jest.spyOn(console, "error").mockImplementation(() => {});

            await messageRepository.findByDiscordId(discordId);

            expect(prismaMock.message.findFirst).toHaveBeenCalledTimes(1);
            expect(prismaMock.message.findFirst).toHaveBeenCalledWith({
                where: { discord_id: discordId }
            });

            expect(spy).toHaveBeenCalledWith(LoggerContextStatus.ERROR);
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

    describe('create methods suite', () => {
        const today = new Date();
        const messageToCreate: Omit<MessageEntity,'id'> = {
            ...mockMessageValue,
            discordCreatedAt: today,
            createdAt: today,
        }

        describe('create', () => {
            it('should insert into db a new message', async () => {
                prismaMock.message.create.mockResolvedValue(mockDbMessageValue);
                
                const newMessage = await messageRepository.create(messageToCreate);

                expect(prismaMock.message.create).toHaveBeenCalledTimes(1);
                expect(prismaMock.message.create).toHaveBeenCalledWith({
                    data: expect.objectContaining({
                        channel_id: messageToCreate.channelId,
                        discord_id: messageToCreate.discordId,
                        user_id: messageToCreate.userId,
                    })
                });

                expect(newMessage).toHaveProperty('id', 1);
            });

            it('should NOT insert into db if an error occurs', async () => {
                const error = new Error('could not create');
                prismaMock.message.create.mockRejectedValue(error);

                const spy = jest.spyOn(console, "error").mockImplementation(() => {});

                await messageRepository.create(messageToCreate);
                
                expect(spy).toHaveBeenCalledWith(LoggerContextStatus.ERROR);
            });
        });

        describe('createMany', () => {
            const otherMessageToCreate: Omit<MessageEntity,'id'> = {
                ...messageToCreate,
                channelId: 3,
                userId: 2,
            }
            const messagesToCreate = [messageToCreate, otherMessageToCreate];

            it('should insert into db new messages', async () => {
                prismaMock.message.createMany.mockResolvedValue({count: messagesToCreate.length});
                
                const totalCreated = await messageRepository.createMany(messagesToCreate);

                expect(prismaMock.message.createMany).toHaveBeenCalledTimes(1);
                expect(prismaMock.message.createMany).toHaveBeenCalledWith({
                    data: expect.arrayContaining(
                        messagesToCreate.map((msg) => {
                            return {
                                channel_id: msg.channelId,
                                discord_id: msg.discordId,
                                user_id: msg.userId,
                                created_at: expect.anything(),
                                discord_created_at: expect.anything(),
                                is_deleted: false,
                                id: undefined,
                            }
                        })
                    ),
                    skipDuplicates: true,
                });

                expect(totalCreated).toEqual(messagesToCreate.length);
            });

            it('should NOT insert into db if an error occurs', async () => {
                const error = new Error('could not create');
                prismaMock.message.createMany.mockRejectedValue(error);

                const spy = jest.spyOn(console, "error").mockImplementation(() => {});

                await messageRepository.createMany(messagesToCreate);
                
                expect(spy).toHaveBeenCalledWith(LoggerContextStatus.ERROR);
            });
        });
    });

    describe('deleteById', () => {
        it('if db returns entity, should delete message succesfully', async () => {
            prismaMock.message.delete.mockResolvedValue(mockDbMessageValue);

            const deleted = await messageRepository.deleteById(mockMessageValue.id);

            expect(prismaMock.message.delete).toHaveBeenCalledTimes(1);
            expect(prismaMock.message.delete).toHaveBeenCalledWith({
                where: {id: mockMessageValue.id}
            });

            expect(deleted).toBeTruthy();
        });

        it('if error occurs, should log it', async () => {
            const error = new Error();
            prismaMock.message.delete.mockRejectedValue(error);

            const spy = jest.spyOn(console, "error").mockImplementation(() => {});

            await messageRepository.deleteById(mockMessageValue.id);

            expect(spy).toHaveBeenCalledWith(LoggerContextStatus.ERROR);
        });
    });
    
    describe('updateById', () => {
        it('should update message successfully', async () => {
            prismaMock.message.update.mockResolvedValue(mockMessageUpdateValue);

            const updatedMessage = await messageRepository.updateById(mockMessageValue.id, {
                ...mockMessageValue,
                isDeleted: true
            });

            expect(prismaMock.message.update).toHaveBeenCalledTimes(1);
            expect(prismaMock.message.update).toHaveBeenCalledWith({
                data: {
                    ...mockMessageUpdateValue,
                    created_at: undefined, 
                    discord_created_at: undefined,
                    id: undefined 
                },
                where: {id: mockMessageValue.id }
            });

            expect(updatedMessage).not.toBeNull();
            expect(updatedMessage).toHaveProperty('isDeleted', true);
        });

        it('should NOT update message if error occurs', async () => {
            const error = new Error();
            prismaMock.message.update.mockRejectedValue(error);

            const spy = jest.spyOn(console, "error").mockImplementation(() => {});

            await messageRepository.updateById(mockMessageValue.id, {
                ...mockMessageValue,
                isDeleted: true
            });

            expect(spy).toHaveBeenCalledWith(LoggerContextStatus.ERROR);
        });
    });
});