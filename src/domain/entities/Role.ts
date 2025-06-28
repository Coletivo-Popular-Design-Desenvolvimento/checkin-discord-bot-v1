
export class RoleEntity {
  constructor(
    public readonly id: number,
    public readonly platformId: string,
    public readonly name: string,
    public readonly created_at: Date,
    public readonly platformCreated_at: Date,
    public readonly userId: string,
    // public readonly userDiscordId: string,
  ) {}
}
