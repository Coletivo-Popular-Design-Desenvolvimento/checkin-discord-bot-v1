export class ChannelEntity {
  constructor(
    public readonly id: number,
    public readonly platformId: string,
    public readonly name: string,
    public readonly url: string,
    public readonly createdAt: Date,
  ) {}
}
