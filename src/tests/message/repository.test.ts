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
        })
    });
})