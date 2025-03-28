/**
 ARQUIVO PARA O MOCK DO PRISMA, SÓ MEXA SE SOUBER O QUE ESTÁ FAZENDO.
 */
class PrismaClient implements PrismaClient {
  constructor() {}
  $connect = jest.fn();
  $disconnect = jest.fn();
}

jest.mock("@prisma/client"); // Auto-mocks PrismaClient

export default PrismaClient;
