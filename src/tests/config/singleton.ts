/**
ARQUIVO PARA O MOCK DO PRISMA, SÓ MEXA SE SOUBER O QUE ESTÁ FAZENDO.
*/
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

import prisma from "./client";

jest.mock("./client", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
